import { NextRequest, NextResponse } from 'next/server';
import { CircleMembershipStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleMessage, toCircleSummary } from '@/lib/server/serializers';
import { computeCircleExpiry } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { ICEBREAKERS } from '@/data/icebreakers';
import {
  countActiveMembers,
  findActiveCircleMembershipForDevice,
} from '@/lib/server/circleMembership';

const DEFAULT_MAX_MEMBERS = 5;

const normalizeText = (value: unknown) =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
    : '';

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

    const result = await prisma.$transaction(async (tx) => {
      // 1. Проверяем, нет ли уже активного участия в круге с этим настроением/интересом
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

      // 2. Пытаемся присоединиться к уже существующему активному кругу
      const candidates = await tx.circle.findMany({
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
        const memberCount = await countActiveMembers(circle.id, tx);
        if (memberCount >= circle.maxMembers) {
          continue;
        }

        await tx.circleMembership.upsert({
          where: {
            circleId_deviceId: {
              circleId: circle.id,
              deviceId,
            },
          },
          update: {
            status: CircleMembershipStatus.active,
          },
          create: {
            circleId: circle.id,
            deviceId,
            status: CircleMembershipStatus.active,
          },
        });

        const newCount = await countActiveMembers(circle.id, tx);

        return {
          circle,
          memberCount: newCount,
          isNewCircle: false,
        };
      }

      // 3. Подходящего круга нет — создаём новый
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

      return {
        circle,
        memberCount: 1,
        isNewCircle: true,
      };
    });

    const membership = await findActiveCircleMembershipForDevice(
      result.circle.id,
      deviceId,
      prisma,
      now,
    );

    if (!membership) {
      return NextResponse.json(
        { ok: false, error: 'NOT_MEMBER' },
        { status: 403 },
      );
    }

    // Полная история сообщений круга
    const messages = await prisma.message.findMany({
      where: { circleId: result.circle.id },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    const response = NextResponse.json({
      ok: true,
      circle: toCircleSummary(result.circle, result.memberCount),
      messages: messages.map(toCircleMessage),
      isNewCircle: result.isNewCircle,
      joined: true,
    });

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('join error', error);
    // Чтобы UI хоть что-то видел
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
