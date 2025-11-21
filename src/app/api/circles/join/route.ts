import { NextRequest, NextResponse } from 'next/server';
import { CircleMembershipStatus, type PrismaClient } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleSummary } from '@/lib/server/serializers';
import { computeCircleExpiry } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { ICEBREAKERS } from '@/data/icebreakers';
import { countActiveMembers } from '@/lib/server/circleMembership';

const DEFAULT_MAX_MEMBERS = 5;

type JoinResult = {
  circle: {
    id: string;
  } & any;
  memberCount: number;
  isNewCircle: boolean;
};

const normalizeText = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

async function findJoinableCircle(
  client: PrismaClient,
  {
    mood,
    interest,
    now,
  }: {
    mood: string;
    interest: string;
    now: Date;
  },
) {
  const candidates = await client.circle.findMany({
    where: {
      status: 'active',
      expiresAt: { gt: now },
      mood,
      interest,
    },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });

  for (const circle of candidates) {
    const memberCount = await countActiveMembers(circle.id, client);
    if (memberCount < circle.maxMembers) {
      return { circle, memberCount };
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const mood = normalizeText(body?.mood);
  const interest = normalizeText(body?.interest);

  if (!mood || !interest) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_PAYLOAD' },
      { status: 400 },
    );
  }

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const now = new Date();

    const result = await prisma.$transaction<JoinResult>(async (tx) => {
      // 1. Если уже есть активный membership в круге с тем же mood+interest — вернём его
      const existingMembership = await tx.circleMembership.findFirst({
        where: {
          deviceId,
          status: CircleMembershipStatus.active,
          circle: {
            status: 'active',
            expiresAt: { gt: now },
            mood,
            interest,
          },
        },
        include: { circle: true },
        orderBy: { joinedAt: 'desc' },
      });

      if (existingMembership?.circle) {
        const memberCount = await countActiveMembers(
          existingMembership.circle.id,
          tx,
        );
        return {
          circle: existingMembership.circle,
          memberCount,
          isNewCircle: false,
        };
      }

      // 2. Пытаемся присоединиться к самому раннему подходящему кругу
      const joinable = await findJoinableCircle(tx, { mood, interest, now });

      if (joinable) {
        await tx.circleMembership.upsert({
          where: {
            circleId_deviceId: {
              circleId: joinable.circle.id,
              deviceId,
            },
          },
          update: { status: CircleMembershipStatus.active },
          create: {
            circleId: joinable.circle.id,
            deviceId,
            status: CircleMembershipStatus.active,
          },
        });

        const memberCount = await countActiveMembers(
          joinable.circle.id,
          tx,
        );

        return {
          circle: joinable.circle,
          memberCount,
          isNewCircle: false,
        };
      }

      // 3. Круга нет — создаём новый
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
        data: {
          circleId: circle.id,
          deviceId,
          status: CircleMembershipStatus.active,
        },
      });

      return { circle, memberCount: 1, isNewCircle: true };
    });

    // Подтягиваем историю сообщений круга
    const messages = await prisma.message.findMany({
      where: { circleId: result.circle.id },
      orderBy: { createdAt: 'asc' },
      include: { author: true },
    });

    const response = NextResponse.json({
      ok: true,
      circle: toCircleSummary(result.circle, result.memberCount),
      messages,
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
