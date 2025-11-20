import { NextRequest, NextResponse } from 'next/server';
import type { Circle as CircleModel, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleMessage, toCircleSummary } from '@/lib/server/serializers';
import { computeCircleExpiry } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import {
  countActiveMembers,
  findLatestActiveMembershipForDevice,
  markMembershipLeft,
} from '@/lib/server/circleMembership';
import { buildCircleMessagesWhere } from '@/lib/server/messageQueries';
import { ICEBREAKERS } from '@/data/icebreakers';
import { getUserWithBlocks } from '@/lib/server/users';

const DEFAULT_MAX_MEMBERS = 5;
const MESSAGE_LIMIT = 50;

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const findJoinableCircle = async (
  client: PrismaClient,
  mood: string,
  interest: string,
): Promise<CircleModel | null> => {
  const now = new Date();
  const candidates = await client.circle.findMany({
    where: {
      mood,
      interest,
      status: 'active',
      expiresAt: { gt: now },
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      mood: true,
      interest: true,
      status: true,
      maxMembers: true,
      startsAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        where: { status: 'active' },
        select: { id: true },
      },
    },
  });

  const available = candidates.find((candidate) => candidate.memberships.length < candidate.maxMembers);
  if (!available) {
    return null;
  }
  const circle = await client.circle.findUnique({ where: { id: available.id } });
  return circle ?? null;
};

const isJoinableMembership = (
  membership: Awaited<ReturnType<typeof findLatestActiveMembershipForDevice>>,
  mood: string,
  interest: string,
) => {
  if (!membership?.circle) {
    return false;
  }
  const now = new Date();
  const circle = membership.circle;
  const isActive = circle.status === 'active' && circle.expiresAt > now;
  const matchesSelection = circle.mood === mood && circle.interest === interest;
  return isActive && matchesSelection;
};

const listRecentMessages = async (circleId: string) => {
  const where = buildCircleMessagesWhere({ circleId });
  const rows = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: MESSAGE_LIMIT,
    include: { user: true },
  });
  return rows.reverse().map(toCircleMessage);
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const mood = normalizeText(body?.mood);
  const interest = normalizeText(body?.interest);

  if (!mood || !interest) {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const existingMembership = await findLatestActiveMembershipForDevice(deviceId, tx);

      if (isJoinableMembership(existingMembership, mood, interest) && existingMembership?.circle) {
        const memberCount = await countActiveMembers(existingMembership.circle.id, tx);
        return { circle: existingMembership.circle, memberCount, isNewCircle: false };
      }

      if (existingMembership) {
        await markMembershipLeft(existingMembership.id, tx);
      }

      let circle = await findJoinableCircle(tx, mood, interest);
      let isNewCircle = false;

      if (!circle) {
        const expiresAt = computeCircleExpiry(now);
        const icebreaker =
          ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)] ??
          ICEBREAKERS[0] ??
          'Поделись, что сегодня тебя порадовало? ✨';
        circle = await tx.circle.create({
          data: {
            mood,
            interest,
            status: 'active',
            maxMembers: DEFAULT_MAX_MEMBERS,
            startsAt: now,
            endsAt: expiresAt,
            expiresAt,
            icebreaker,
          },
        });
        isNewCircle = true;
      }

      const activeMembership = await tx.circleMembership.findFirst({
        where: { circleId: circle.id, deviceId, status: 'active' },
      });

      if (!activeMembership) {
        await tx.circleMembership.create({
          data: { circleId: circle.id, deviceId },
        });
      }

      const memberCount = await countActiveMembers(circle.id, tx);

      return { circle, memberCount, isNewCircle };
    });

    const [messages, userBlocks] = await Promise.all([
      listRecentMessages(result.circle.id),
      getUserWithBlocks(deviceId),
    ]);
    const blockedSet = new Set(
      userBlocks?.blocksInitiated?.map((block) => block.blockedId) ?? [],
    );
    const filteredMessages = blockedSet.size
      ? messages.filter((message) => !message.author?.id || !blockedSet.has(message.author.id))
      : messages;
    const response = NextResponse.json({
      circle: toCircleSummary(result.circle, result.memberCount),
      messages: filteredMessages,
      isNewCircle: result.isNewCircle,
    });

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('join error', error);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
