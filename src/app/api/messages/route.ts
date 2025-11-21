import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { isDeviceCircleMember } from '@/lib/server/circleMembership';
import { toCircleMessage } from '@/lib/server/serializers';
import { findUserByDeviceId } from '@/lib/server/users';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get('circleId');

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

    const messages = await prisma.message.findMany({
      where: { circleId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: true,
      },
    });

    const normalized = messages.map(toCircleMessage);

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

  if (!circleId || !content) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_PAYLOAD' },
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

    return NextResponse.json({ ok: true, message: serialized }, { status: 200 });
  } catch (error) {
    console.error('messages POST error', error);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
