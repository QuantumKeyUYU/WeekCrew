import { NextRequest, NextResponse } from 'next/server';

import { getPrismaClient } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { findActiveCircleMembershipForDevice } from '@/lib/server/circleMembership';
import { toCircleMessage } from '@/lib/server/serializers';
import { broadcastRealtimeEvent, getCircleChannelName } from '@/lib/realtime';
import {
  applyMessageUsageToQuota,
  checkDailyMessageLimit,
} from '@/lib/server/messages';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get('circleId');
  const sinceParam = searchParams.get('since');
  const sinceDate = sinceParam ? new Date(sinceParam) : null;
  const hasValidSince = Boolean(sinceDate) && !Number.isNaN(sinceDate?.getTime());

  if (!circleId) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload' },
      { status: 400 },
    );
  }

  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      return NextResponse.json({ ok: false, error: 'BACKEND_DISABLED' }, { status: 503 });
    }

    const { id: deviceId } = await getOrCreateDevice(request, prisma);
    const now = new Date();

    const membership = await findActiveCircleMembershipForDevice(
      circleId,
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

    const { quota } = await checkDailyMessageLimit(prisma, { circleId, deviceId });

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(hasValidSince ? { createdAt: { gt: sinceDate } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    return NextResponse.json(
      { ok: true, messages: messages.map(toCircleMessage), quota },
      { status: 200 },
    );
  } catch (error) {
    console.error('messages GET error', error);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const circleId =
    typeof body?.circleId === 'string' ? body.circleId.trim() : '';
  const content =
    typeof body?.content === 'string' ? body.content.trim() : '';

  if (!circleId || !content) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload' },
      { status: 400 },
    );
  }

  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      return NextResponse.json({ ok: false, error: 'BACKEND_DISABLED' }, { status: 503 });
    }

    const { id: deviceId } = await getOrCreateDevice(request, prisma);

    const now = new Date();
    const membership = await findActiveCircleMembershipForDevice(
      circleId,
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

    const quotaCheck = await checkDailyMessageLimit(prisma, { circleId, deviceId });

    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: 'daily_limit_exceeded', quota: quotaCheck.quota },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { deviceId } });

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        userId: user?.id ?? null,
        content,
      },
      include: { user: true },
    });

    const channel = getCircleChannelName(circleId);
    broadcastRealtimeEvent(channel, 'new-message', toCircleMessage(message));

    const nextQuota = applyMessageUsageToQuota(quotaCheck.quota);

    return NextResponse.json(
      { ok: true, message: toCircleMessage(message), quota: nextQuota },
      { status: 200 },
    );
  } catch (error) {
    console.error('messages POST error', error);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 },
    );
  }
}
