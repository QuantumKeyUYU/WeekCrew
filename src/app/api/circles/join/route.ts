import { NextRequest, NextResponse } from 'next/server';
import type { Circle, PrismaClient } from '@prisma/client';
import { CircleMembershipStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleMessage, toCircleSummary } from '@/lib/server/serializers';
import { computeCircleExpiry, isCircleActive } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { ICEBREAKERS } from '@/data/icebreakers';
import { countActiveMembers, findLatestActiveMembershipForDevice } from '@/lib/server/circleMembership';
import { buildCircleMessagesWhere } from '@/lib/server/messageQueries';
import { getUserWithBlocks } from '@/lib/server/users';

const DEFAULT_MAX_MEMBERS = 5;

type JoinResult = {
  circle: Circle;
  memberCount: number;
  isNewCircle: boolean;
};

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const findJoinableCircle = async (
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
) => {
  const candidates = await client.circle.findMany({
    where: {
      mood,
      interest,
      status: 'active',
      expiresAt: { gt: now },
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
};

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
      // 1. Если девайс уже состоит в активном круге — просто возвращаем его
      const existingMembership = await findLatestActiveMembershipForDevice(deviceId, tx);

      if (existingMembership?.circle && isCircleActive(existingMembership.circle, now)) {
        const memberCount = await countActiveMembers(existingMembership.circle.id, tx);
        return { circle: existingMembership.circle, memberCount, isNewCircle: false };
      }

      // 2. Иначе пытаемся присоединить к уже существующему «подходящему» кругу
      const joinable = await findJoinableCircle(tx, { mood, interest, now });

      if (joinable) {
        const existingMembership = await tx.circleMembership.findFirst({
          where: {
            circleId: joinable.circle.id,
            deviceId,
          },
          orderBy: { joinedAt: 'desc' },
        });

        if (existingMembership) {
          if (existingMembership.status !== CircleMembershipStatus.active) {
            await tx.circleMembership.update({
              where: { id: existingMembership.id },
              data: { status: CircleMembershipStatus.active, joinedAt: now, leftAt: null },
            });
          }
        } else {
          await tx.circleMembership.create({
            data: {
              circleId: joinable.circle.id,
              deviceId,
              status: CircleMembershipStatus.active,
            },
          });
        }

        const memberCount = await countActiveMembers(joinable.circle.id, tx);
        return { circle: joinable.circle, memberCount, isNewCircle: false };
      }

      // 3. Подходящих кругов нет — создаём новый
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

    const user = await getUserWithBlocks(deviceId);
    const blockedIds = user?.blocksInitiated?.map((block) => block.blockedId) ?? [];

    const messageFilters = buildCircleMessagesWhere({
      circleId: result.circle.id,
      blockedUserIds: blockedIds,
    });

    const messages = await prisma.message.findMany({
      where: messageFilters,
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    const payload = {
      ok: true,
      circle: toCircleSummary(result.circle, result.memberCount ?? 1),
      messages: messages.map(toCircleMessage),
      isNewCircle: result.isNewCircle ?? false,
    };

    const response = NextResponse.json(payload);

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
