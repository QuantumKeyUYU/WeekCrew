import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { isDeviceCircleMember } from '@/lib/server/circleMembership';
import { toCircleMessage } from '@/lib/server/serializers';
import { DEVICE_HEADER_NAME } from '@/lib/device';

const MAX_RESULTS = 200;

const parseSinceParam = (value: string | null) => {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp);
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get('circleId');
  const since = parseSinceParam(searchParams.get('since'));

  if (!circleId) {
    return NextResponse.json({ messages: [] }, { status: 400 });
  }

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const canAccess = await isDeviceCircleMember(circleId, deviceId);

    if (!canAccess) {
      return NextResponse.json({ error: 'not_member' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(since ? { createdAt: { gt: since } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_RESULTS,
    });

    const response = NextResponse.json({ messages: messages.map(toCircleMessage) });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('Failed to list messages', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const circleId = typeof body?.circleId === 'string' ? body.circleId : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!circleId || !content) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const canSend = await isDeviceCircleMember(circleId, deviceId);

    if (!canSend) {
      return NextResponse.json({ error: 'not_member' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        content,
        isSystem: false,
      },
    });

    const response = NextResponse.json({ message: toCircleMessage(message) }, { status: 201 });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('Failed to send message', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
