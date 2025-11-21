import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { isDeviceCircleMember } from '@/lib/server/circleMembership';
import { findUserByDeviceId } from '@/lib/server/users';
import { broadcastRealtimeEvent, getCircleChannelName } from '@/lib/realtime';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const messageId = typeof body?.messageId === 'string' ? body.messageId.trim() : '';
  const emoji = typeof body?.emoji === 'string' ? body.emoji.trim() : '';

  if (!messageId || !emoji) {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const { id: deviceId } = await getOrCreateDevice(request);
    const user = await findUserByDeviceId(deviceId);

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const canAccess = await isDeviceCircleMember(message.circleId, deviceId);
    if (!canAccess || !user) {
      return NextResponse.json({ ok: false, error: 'NOT_MEMBER' }, { status: 403 });
    }

    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        emoji,
        authorId: user.id,
      },
    });

    const channel = getCircleChannelName(message.circleId);
    broadcastRealtimeEvent(channel, 'message-reaction', reaction);

    return NextResponse.json({ ok: true, reaction }, { status: 200 });
  } catch (error) {
    console.error('reactions POST error', error);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
