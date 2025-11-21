import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleMessage } from '@/lib/server/serializers';

const findMembershipWithUser = async (circleId: string, deviceId: string) =>
  prisma.circleMembership.findFirst({
    where: { circleId, deviceId, status: 'active' },
    include: { device: { include: { user: true } } },
  });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get('circleId');
  const sinceRaw = searchParams.get('since');
  const since = sinceRaw ? new Date(sinceRaw) : null;

  if (!circleId) {
    return NextResponse.json(
      { ok: false, error: 'MISSING_CIRCLE_ID' },
      { status: 400 },
    );
  }

  try {
    const { id: deviceId } = await getOrCreateDevice(request);
    const membership = await findMembershipWithUser(circleId, deviceId);

    if (!membership) {
      return NextResponse.json(
        { ok: false, error: 'not_member' },
        { status: 403 },
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(since && !Number.isNaN(since.getTime())
          ? { createdAt: { gt: since } }
          : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    return NextResponse.json(
      { ok: true, messages: messages.map(toCircleMessage) },
      { status: 200 },
    );
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
  const circleId =
    typeof body?.circleId === 'string' ? body.circleId.trim() : '';
  const content =
    typeof body?.content === 'string' ? body.content.trim() : '';

  if (!circleId || !content) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_PAYLOAD' },
      { status: 400 },
    );
  }

  try {
    const { id: deviceId } = await getOrCreateDevice(request);
    const membership = await findMembershipWithUser(circleId, deviceId);

    if (!membership) {
      return NextResponse.json(
        { ok: false, error: 'not_member' },
        { status: 403 },
      );
    }

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        userId: membership.device.user?.id,
        content,
      },
      include: { user: true },
    });

    return NextResponse.json(
      { ok: true, message: toCircleMessage(message) },
      { status: 200 },
    );
  } catch (error) {
    console.error('messages POST error', error);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
