import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { countActiveMembers, isDeviceCircleMember } from '@/lib/server/circleMembership';
import { toCircleMessage } from '@/lib/server/serializers';
import { isCircleActive } from '@/lib/server/circles';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { applyMessageUsageToQuota, checkDailyMessageLimit } from '@/lib/server/messages';
import { buildCircleMessagesWhere } from '@/lib/server/messageQueries';
import { getUserWithBlocks } from '@/lib/server/users';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get('circleId')?.trim();

  if (!circleId) {
    return NextResponse.json({ error: 'circle_required' }, { status: 400 });
  }

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const canAccess = await isDeviceCircleMember(circleId, deviceId);

    if (!canAccess) {
      return NextResponse.json({ error: 'not_member' }, { status: 403 });
    }

    const user = await getUserWithBlocks(deviceId);

    const blockedIds = user?.blocksInitiated?.map((block) => block.blockedId) ?? [];
    const messageFilters = buildCircleMessagesWhere({
      circleId,
      blockedUserIds: blockedIds,
    });

    const [messages, memberCount, quota] = await Promise.all([
      prisma.message.findMany({
        where: messageFilters,
        orderBy: { createdAt: 'asc' },
        include: { user: true },
      }),
      countActiveMembers(circleId),
      checkDailyMessageLimit(prisma, { circleId, deviceId }),
    ]);

    const response = NextResponse.json({
      messages: messages.map(toCircleMessage),
      quota: quota.quota,
      memberCount,
      debug: {
        circleId,
        messagesCount: messages.length,
        membersCount: memberCount,
      },
    });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('messages list error', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const circleId = typeof body?.circleId === 'string' ? body.circleId.trim() : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!circleId) {
    return NextResponse.json({ error: 'circle_required' }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const canSend = await isDeviceCircleMember(circleId, deviceId);

    if (!canSend) {
      return NextResponse.json({ error: 'not_member' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { deviceId } });
    const circle = await prisma.circle.findUnique({ where: { id: circleId } });

    if (!circle || !isCircleActive(circle)) {
      return NextResponse.json({ error: 'circle_expired' }, { status: 403 });
    }

    const quotaResult = await checkDailyMessageLimit(prisma, { circleId, deviceId });

    if (!quotaResult.allowed) {
      return NextResponse.json(
        { ok: false, error: 'daily_limit_exceeded', quota: quotaResult.quota },
        { status: 429 },
      );
    }

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        userId: user?.id,
        content,
        isSystem: false,
      },
      include: { user: true },
    });

    const response = NextResponse.json(
      {
        ok: true,
        message: toCircleMessage(message),
        quota: applyMessageUsageToQuota(quotaResult.quota),
      },
      { status: 201 },
    );
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('message send error', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
