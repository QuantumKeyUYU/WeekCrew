import { NextRequest, NextResponse } from 'next/server';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleSummary } from '@/lib/server/serializers';
import { computeCircleExpiry } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { ICEBREAKERS } from '@/data/icebreakers';
import { CircleMembershipStatus } from '@prisma/client';

const DEFAULT_MAX_MEMBERS = 5;

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const deleteExistingCirclesForDevice = async (
  client: PrismaClient,
  deviceId: string,
) => {
  const memberships = await client.circleMembership.findMany({
    where: { deviceId },
    select: { circleId: true },
  });

  const circleIds = [...new Set(memberships.map((membership) => membership.circleId))];

  if (!circleIds.length) {
    return;
  }

  await client.message.deleteMany({ where: { circleId: { in: circleIds } } });
  await client.circleMembership.deleteMany({ where: { circleId: { in: circleIds } } });
  await client.circle.deleteMany({ where: { id: { in: circleIds } } });
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
      await deleteExistingCirclesForDevice(tx, deviceId);

      const expiresAt = computeCircleExpiry(now);
      const icebreaker =
        ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)] ??
        ICEBREAKERS[0] ??
        'Поделись, что сегодня тебя порадовало? ✨';

      const circle = await tx.circle.create({
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

      await tx.circleMembership.create({
        data: { circleId: circle.id, deviceId, status: CircleMembershipStatus.active },
      });

      return { circle };
    });
    const response = NextResponse.json({
      circle: toCircleSummary(result.circle, 1),
      messages: [],
      isNewCircle: true,
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
