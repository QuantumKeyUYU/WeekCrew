import { NextRequest, NextResponse } from 'next/server';
import type { Circle as CircleModel, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleMessage, toCircleSummary } from '@/lib/server/serializers';
import { computeCircleExpiry } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { countActiveMembers } from '@/lib/server/circleMembership';
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

const findExistingCircle = async (
  client: PrismaClient,
  mood: string,
  interest: string,
  now: Date,
): Promise<CircleModel | null> =>
  client.circle.findFirst({
    where: {
      mood,
      interest,
      status: 'active',
      expiresAt: { gt: now },
    },
    orderBy: { startsAt: 'asc' },
  });

const listRecentMessages = async (circleId: string, blockedUserIds: string[] = []) => {
  const where = buildCircleMessagesWhere({ circleId, blockedUserIds });
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
      let circle = await findExistingCircle(tx, mood, interest, now);
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

      const existingMembership = await tx.circleMembership.findFirst({
        where: { circleId: circle.id, deviceId },
        orderBy: { joinedAt: 'desc' },
      });

      if (existingMembership?.status === 'left') {
        await tx.circleMembership.update({
          where: { id: existingMembership.id },
          data: { status: 'active', leftAt: null, joinedAt: now },
        });
      } else if (!existingMembership) {
        await tx.circleMembership.create({
          data: { circleId: circle.id, deviceId },
        });
      }

      const memberCount = await countActiveMembers(circle.id, tx);

      return { circle, memberCount, isNewCircle };
    });

    const userBlocks = await getUserWithBlocks(deviceId);
    const blockedIds = userBlocks?.blocksInitiated?.map((block) => block.blockedId) ?? [];
    const messages = await listRecentMessages(result.circle.id, blockedIds);
    const response = NextResponse.json({
      circle: toCircleSummary(result.circle, result.memberCount),
      messages,
      isNewCircle: result.isNewCircle,
      debug: {
        circleId: result.circle.id,
        messagesCount: messages.length,
        membersCount: result.memberCount,
      },
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
