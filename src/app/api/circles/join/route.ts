// src/app/api/circles/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { getOrCreateDevice } from '@/lib/server/device';
import { computeCircleExpiry } from '@/lib/server/circles';
import { toCircleMessage, toCircleSummary } from '@/lib/server/serializers';
import { countActiveMembers } from '@/lib/server/circleMembership';

const DEFAULT_MAX_MEMBERS = 6 as const;

const buildValidationError = (message: string) =>
  NextResponse.json({ ok: false as const, error: message }, { status: 400 });

const findExistingMembership = async (
  deviceId: string,
  mood: string,
  interest: string,
  now: Date,
) =>
  prisma.circleMembership.findFirst({
    where: {
      deviceId,
      status: 'active',
      leftAt: null,
      circle: {
        mood,
        interest,
        status: 'active',
        expiresAt: { gt: now },
      },
    },
    include: { circle: true },
    orderBy: { joinedAt: 'desc' },
  });

const findJoinableCircle = async (mood: string, interest: string, now: Date) => {
  const candidates = await prisma.circle.findMany({
    where: {
      mood,
      interest,
      status: 'active',
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'asc' },
  });

  for (const candidate of candidates) {
    const activeCount = await countActiveMembers(candidate.id);
    if (activeCount < candidate.maxMembers) {
      return candidate;
    }
  }

  return null;
};

const ensureMembership = async (circleId: string, deviceId: string) =>
  prisma.circleMembership.upsert({
    where: { circleId_deviceId: { circleId, deviceId } },
    update: { status: 'active', leftAt: null },
    create: { circleId, deviceId, status: 'active' },
  });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { mood?: string; interest?: string }
      | null;

    const mood = body?.mood?.trim();
    const interest = body?.interest?.trim();

    if (!mood || !interest) {
      return buildValidationError('mood_and_interest_required');
    }

    const { id: deviceId, isNew } = await getOrCreateDevice(req);
    const now = new Date();

    const existingMembership = await findExistingMembership(
      deviceId,
      mood,
      interest,
      now,
    );

    let circle = existingMembership?.circle ?? null;
    let isNewCircle = false;

    if (!circle) {
      const candidate = await findJoinableCircle(mood, interest, now);
      if (candidate) {
        circle = candidate;
      }
    }

    if (!circle) {
      const expiresAt = computeCircleExpiry(now);
      circle = await prisma.circle.create({
        data: {
          mood,
          interest,
          status: 'active',
          maxMembers: DEFAULT_MAX_MEMBERS,
          startsAt: now,
          endsAt: expiresAt,
          expiresAt,
        },
      });
      isNewCircle = true;
    }

    await prisma.circleMembership.updateMany({
      where: {
        deviceId,
        status: 'active',
        leftAt: null,
        circleId: { not: circle.id },
      },
      data: { status: 'left', leftAt: now },
    });

    await ensureMembership(circle.id, deviceId);

    const memberCount = await countActiveMembers(circle.id);
    console.info(`[JOIN] Device ${deviceId} joined circle ${circle.id}`);
    const messages = await prisma.message.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    const response = NextResponse.json(
      {
        ok: true as const,
        circle: toCircleSummary(circle, memberCount),
        messages: messages.map(toCircleMessage),
        isNewCircle,
        quota: null,
        memberCount,
      },
      { status: 200 },
    );

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('[api/circles/join] failed', error);
    return NextResponse.json(
      { ok: false as const, error: 'internal_error' },
      { status: 500 },
    );
  }
}
