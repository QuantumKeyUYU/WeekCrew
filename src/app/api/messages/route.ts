import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import {
  findActiveCircleMembership,
  isDeviceCircleMember,
} from '@/lib/server/circleMembership';
import { toCircleMessage } from '@/lib/server/serializers';

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
    const { id: deviceId } = await getOrCreateDevice(request);

    const canAccess = await isDeviceCircleMember(circleId, deviceId);
    if (!canAccess) {
      return NextResponse.json(
        { ok: false, error: 'not_member' },
        { status: 403 },
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(hasValidSince ? { createdAt: { gt: sinceDate } } : {}),
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
    const { id: deviceId } = await getOrCreateDevice(request);

    const membership = await findActiveCircleMembership(circleId, deviceId);
    if (!membership) {
      return NextResponse.json(
        { ok: false, error: 'not_member' },
        { status: 403 },
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

    return NextResponse.json(
      { ok: true, message: toCircleMessage(message) },
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
