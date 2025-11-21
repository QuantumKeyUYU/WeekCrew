import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { isDeviceCircleMember } from '@/lib/server/circleMembership';
import { toCircleMessage } from '@/lib/server/serializers';
import { buildCircleMessagesWhere } from '@/lib/server/messageQueries';
import { broadcastRealtimeEvent, getCircleChannelName } from '@/lib/realtime';
import { findUserByDeviceId } from '@/lib/server/users';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get('circleId');
  const limitParam = searchParams.get('limit');
  const sinceParam = searchParams.get('since');

  const parsedLimit = Number(limitParam ?? 50);
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50;
  const since = sinceParam ? new Date(sinceParam) : null;

  if (!circleId) {
    return NextResponse.json(
      { ok: false, error: 'MISSING_CIRCLE_ID' },
      { status: 400 },
    );
  }

  try {
    const { id: deviceId } = await getOrCreateDevice(request);

    const canAccess = await isDeviceCircleMember(circleId, deviceId);
    if (!canAccess) {
      return NextResponse.json(
        { ok: false, error: 'NOT_MEMBER' },
        { status: 403 },
      );
    }

    const where = buildCircleMessagesWhere({ circleId, since });

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: since ? 'asc' : 'desc' },
      include: {
        user: true,
      },
      take: limit,
    });

    const normalized = (since ? messages : messages.reverse()).map(toCircleMessage);

    return NextResponse.json({ ok: true, messages: normalized }, { status: 200 });
  } catch (error) {
    console.error('messages GET error', error);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const circleId = typeof body?.circleId === 'string' ? body.circleId.trim() : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const declaredDeviceId = typeof body?.deviceId === 'string' ? body.deviceId.trim() : '';

  if (!circleId || !content) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_PAYLOAD' },
      { status: 400 },
    );
  }

  try {
    const { id: deviceId } = await getOrCreateDevice(request);

    if (declaredDeviceId && declaredDeviceId !== deviceId) {
      return NextResponse.json({ ok: false, error: 'DEVICE_MISMATCH' }, { status: 403 });
    }

    const canAccess = await isDeviceCircleMember(circleId, deviceId);
    if (!canAccess) {
      return NextResponse.json(
        { ok: false, error: 'NOT_MEMBER' },
        { status: 403 },
      );
    }

    const user = await findUserByDeviceId(deviceId);

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        userId: user?.id,
        content,
      },
      include: {
        user: true,
      },
    });

    const serialized = toCircleMessage(message);

    const channel = getCircleChannelName(circleId);
    const origin = request.headers.get('origin');
    const requestOrigin = new URL(request.url).origin;
    const allowedOrigins = [requestOrigin];
    if (process.env.NEXT_PUBLIC_APP_URL) {
      allowedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
    }
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ ok: false, error: 'INVALID_ORIGIN' }, { status: 403 });
    }

    broadcastRealtimeEvent(channel, 'new-message', serialized);

    return NextResponse.json({ ok: true, message: serialized }, { status: 200 });
  } catch (error) {
    console.error('messages POST error', error);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
