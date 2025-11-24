// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleMessage } from '@/lib/server/serializers';
import { isCircleActive } from '@/lib/server/circles';
import { countActiveMembers } from '@/lib/server/circleMembership';
import { DEVICE_HEADER_NAME } from '@/lib/device';

const MAX_CONTENT_LENGTH = 2000;

const readSinceParam = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const validateContent = (content: string | undefined | null) => {
  const trimmed = content?.trim() ?? '';
  if (!trimmed || trimmed.length > MAX_CONTENT_LENGTH) {
    return null;
  }
  return trimmed;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get('circleId');
    const since = readSinceParam(searchParams.get('since'));

    if (!circleId) {
      return NextResponse.json(
        { ok: false as const, error: 'circle_id_required' },
        { status: 400 },
      );
    }

    const { id: deviceId, isNew } = await getOrCreateDevice(req);

    const membership = await prisma.circleMembership.findFirst({
      where: { circleId, deviceId, status: 'active', leftAt: null },
    });

    if (!membership) {
      return NextResponse.json(
        { ok: false as const, error: 'not_member' },
        { status: 403 },
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(since ? { createdAt: { gt: since } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    const memberCount = await countActiveMembers(circleId);

    const response = NextResponse.json(
      {
        ok: true as const,
        messages: messages.map(toCircleMessage),
        quota: null,
        memberCount,
      },
      { status: 200 },
    );

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('[api/messages] GET failed', error);
    return NextResponse.json(
      { ok: false as const, error: 'internal_error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { circleId?: string; content?: string }
      | null;

    const circleId = body?.circleId?.trim();
    const content = validateContent(body?.content);

    if (!circleId) {
      return NextResponse.json(
        { ok: false as const, error: 'circle_id_required' },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { ok: false as const, error: 'invalid_content' },
        { status: 400 },
      );
    }

    const { id: deviceId, isNew } = await getOrCreateDevice(req);

    const membership = await prisma.circleMembership.findFirst({
      where: { circleId, deviceId, status: 'active', leftAt: null },
      include: { circle: true },
    });

    if (!membership) {
      return NextResponse.json(
        { ok: false as const, error: 'not_member' },
        { status: 403 },
      );
    }

    if (!membership.circle || !isCircleActive(membership.circle)) {
      return NextResponse.json(
        { ok: false as const, error: 'circle_expired' },
        { status: 403 },
      );
    }

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        content,
        isSystem: false,
      },
      include: { user: true },
    });

    const response = NextResponse.json(
      { ok: true as const, message: toCircleMessage(message), quota: null },
      { status: 200 },
    );

    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }

    return response;
  } catch (error) {
    console.error('[api/messages] POST failed', error);
    return NextResponse.json(
      { ok: false as const, error: 'internal_error' },
      { status: 500 },
    );
  }
}
