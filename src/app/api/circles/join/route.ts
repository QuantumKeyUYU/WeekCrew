import { NextRequest, NextResponse } from 'next/server';
import type { Circle as CircleModel, PrismaClient } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { getOrCreateDevice } from '@/server/device';
import { toCircleMessage, toCircleSummary } from '@/server/serializers';
import { DEVICE_HEADER_NAME } from '@/lib/device';

const DEFAULT_MAX_MEMBERS = 5;
const CIRCLE_DURATION_DAYS = 7;
const MS_IN_DAY = 1000 * 60 * 60 * 24;
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
      endsAt: { gt: now },
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      mood: true,
      interest: true,
      status: true,
      maxMembers: true,
      startsAt: true,
      endsAt: true,
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

const getCircleMemberCount = (client: PrismaClient, circleId: string) =>
  client.circleMembership.count({ where: { circleId, status: 'active' } });

const listRecentMessages = async (circleId: string) => {
  const rows = await prisma.message.findMany({
    where: { circleId },
    orderBy: { createdAt: 'desc' },
    take: MESSAGE_LIMIT,
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
      await tx.circleMembership.updateMany({
        where: { deviceId, status: 'active' },
        data: { status: 'left', leftAt: now },
      });

      let circle = await findJoinableCircle(tx, mood, interest);
      let isNewCircle = false;

      if (!circle) {
        circle = await tx.circle.create({
          data: {
            mood,
            interest,
            status: 'active',
            maxMembers: DEFAULT_MAX_MEMBERS,
            startsAt: now,
            endsAt: new Date(now.getTime() + CIRCLE_DURATION_DAYS * MS_IN_DAY),
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

      const memberCount = await getCircleMemberCount(tx, circle.id);

      return { circle, memberCount, isNewCircle };
    });

    const messages = await listRecentMessages(result.circle.id);
    const response = NextResponse.json({
      circle: toCircleSummary(result.circle, result.memberCount),
      messages,
      isNewCircle: result.isNewCircle,
    });

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('Failed to join circle', error);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
