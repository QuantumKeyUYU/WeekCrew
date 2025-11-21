import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { broadcastRealtimeEvent, getCircleChannelName } from '@/lib/realtime';
import { getOrCreateDevice } from '@/lib/server/device';
import { isDeviceCircleMember } from '@/lib/server/circleMembership';
import { findUserByDeviceId } from '@/lib/server/users';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const circleId = typeof body?.circleId === 'string' ? body.circleId.trim() : '';

  if (!circleId) {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      return NextResponse.json({ ok: false, error: 'BACKEND_DISABLED' }, { status: 503 });
    }

    const { id: deviceId } = await getOrCreateDevice(request, prisma);

    const canAccess = await isDeviceCircleMember(circleId, deviceId, prisma);
    if (!canAccess) {
      return NextResponse.json({ ok: false, error: 'NOT_MEMBER' }, { status: 403 });
    }

    const user = await findUserByDeviceId(deviceId);
    const channel = getCircleChannelName(circleId);
    broadcastRealtimeEvent(channel, 'typing', {
      deviceId,
      nickname: user?.nickname ?? null,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('typing POST error', error);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
