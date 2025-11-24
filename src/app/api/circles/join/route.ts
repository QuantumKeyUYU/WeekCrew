import { NextRequest, NextResponse } from 'next/server';
import { isLiveBackendEnabled, prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { computeCircleExpiry, isCircleActive } from '@/lib/server/circles';
import {
  countActiveMembers,
  findLatestActiveMembershipForDevice,
  markMembershipLeft,
} from '@/lib/server/circleMembership';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { toCircleMessage, toCircleSummary } from '@/lib/server/serializers';

const MAX_MEMBERS_PER_CIRCLE = 8;

const parseJoinBody = (body: unknown) => {
  if (!body || typeof body !== 'object') return null;
  const { mood, interest } = body as { mood?: unknown; interest?: unknown };

  const normalizedMood = typeof mood === 'string' ? mood.trim() : '';
  const normalizedInterest = typeof interest === 'string' ? interest.trim() : '';

  if (!normalizedMood || !normalizedInterest) {
    return null;
  }

  return { mood: normalizedMood, interest: normalizedInterest };
};

const ensureActiveMembership = async (circleId: string, deviceId: string) =>
  prisma.circleMembership.upsert({
    where: { circleId_deviceId: { circleId, deviceId } },
    update: { status: 'active', leftAt: null },
    create: { circleId, deviceId, status: 'active' },
  });

const findCircleWithSpace = async (mood: string, interest: string) => {
  const now = new Date();
  const candidates = await prisma.circle.findMany({
    where: { mood, interest, status: 'active', expiresAt: { gt: now } },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  for (const candidate of candidates) {
    const memberCount = await countActiveMembers(candidate.id);
    if (memberCount < candidate.maxMembers) {
      return { circle: candidate, memberCount } as const;
    }
  }

  return null;
};

const createCircle = async (mood: string, interest: string) => {
  const startsAt = new Date();
  const expiresAt = computeCircleExpiry(startsAt);

  const circle = await prisma.circle.create({
    data: {
      mood,
      interest,
      status: 'active',
      maxMembers: MAX_MEMBERS_PER_CIRCLE,
      startsAt,
      endsAt: expiresAt,
      expiresAt,
    },
  });

  return { circle, memberCount: 0, isNewCircle: true as const };
};

export async function POST(req: NextRequest) {
  try {
    if (!isLiveBackendEnabled) {
      return NextResponse.json(
        { ok: false as const, error: 'backend_disabled' },
        { status: 503 },
      );
    }

    const parsed = parseJoinBody(await req.json().catch(() => null));

    if (!parsed) {
      return NextResponse.json({ ok: false as const, error: 'invalid_payload' }, { status: 400 });
    }

    const { mood, interest } = parsed;
    const { id: deviceId, isNew } = await getOrCreateDevice(req);
    const now = new Date();

    const latestMembership = await findLatestActiveMembershipForDevice(deviceId);

    if (latestMembership && !isCircleActive(latestMembership.circle, now)) {
      await markMembershipLeft(latestMembership.id);
      if (latestMembership.circle.status === 'active') {
        await prisma.circle.update({
          where: { id: latestMembership.circleId },
          data: { status: 'finished' },
        });
      }
    }

    let circle =
      latestMembership && isCircleActive(latestMembership.circle, now)
        ? latestMembership.circle
        : null;
    let memberCount = circle ? await countActiveMembers(circle.id) : 0;
    let isNewCircle = false;

    if (!circle) {
      const existing = await findCircleWithSpace(mood, interest);
      if (existing) {
        circle = existing.circle;
        memberCount = existing.memberCount;
      }
    }

    if (!circle) {
      const created = await createCircle(mood, interest);
      circle = created.circle;
      memberCount = created.memberCount;
      isNewCircle = created.isNewCircle;
    }

    // оставляем только один активный круг на устройство
    await prisma.circleMembership.updateMany({
      where: {
        deviceId,
        status: 'active',
        leftAt: null,
        circleId: { not: circle.id },
      },
      data: { status: 'left', leftAt: new Date() },
    });

    await ensureActiveMembership(circle.id, deviceId);

    const [messages, refreshedMemberCount] = await Promise.all([
      prisma.message.findMany({
        where: { circleId: circle.id },
        orderBy: { createdAt: 'asc' },
        include: { user: true },
      }),
      countActiveMembers(circle.id),
    ]);

    const response = NextResponse.json(
      {
        ok: true as const,
        circle: toCircleSummary(circle, refreshedMemberCount),
        messages: messages.map(toCircleMessage),
        isNewCircle,
        quota: null,
        memberCount: refreshedMemberCount,
      },
      { status: 200 },
    );

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('[api/circles/join] error', error);
    return NextResponse.json(
      { ok: false as const, error: 'internal_error' },
      { status: 500 },
    );
  }
}
