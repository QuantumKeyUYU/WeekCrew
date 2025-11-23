// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getDeviceId(req: NextRequest): string | null {
  const headerDeviceId = req.headers.get('x-device-id') ?? undefined;
  const cookieDeviceId = req.cookies.get('deviceId')?.value ?? undefined;
  return headerDeviceId || cookieDeviceId || null;
}

// GET /api/messages?circleId=...
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const circleId = url.searchParams.get('circleId');

    if (!circleId) {
      return NextResponse.json(
        { error: 'circle_id_required' },
        { status: 400 },
      );
    }

    const deviceId = getDeviceId(req);
    if (!deviceId) {
      return NextResponse.json(
        { error: 'device_id_missing' },
        { status: 400 },
      );
    }

    // Проверяем, что девайс вообще состоит в этом круге
    const membership = await prisma.circleMembership.findFirst({
      where: {
        circleId,
        deviceId,
        status: 'active',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'not_member' },
        { status: 403 },
      );
    }

    const messages = await prisma.message.findMany({
      where: { circleId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    const memberCount = await prisma.circleMembership.count({
      where: {
        circleId,
        status: 'active',
      },
    });

    return NextResponse.json(
      {
        messages,
        quota: null as const,
        memberCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[api/messages] GET failed', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 },
    );
  }
}

// POST /api/messages
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { circleId?: string; content?: string }
      | null;

    const circleId = body?.circleId?.trim();
    const content = body?.content?.trim();

    if (!circleId || !content) {
      return NextResponse.json(
        { error: 'circle_id_and_content_required' },
        { status: 400 },
      );
    }

    const deviceId = getDeviceId(req);
    if (!deviceId) {
      return NextResponse.json(
        { error: 'device_id_missing' },
        { status: 400 },
      );
    }

    // Проверяем, что девайс в этом круге
    const membership = await prisma.circleMembership.findFirst({
      where: {
        circleId,
        deviceId,
        status: 'active',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'not_member' },
        { status: 403 },
      );
    }

    // Ищем пользователя по deviceId, чтобы связать message.userId
    const user = await prisma.user.findUnique({
      where: { deviceId },
      select: { id: true },
    });

    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        userId: user?.id ?? null,
        content,
        isSystem: false,
      },
    });

    return NextResponse.json(
      {
        message,
        quota: null as const,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[api/messages] POST failed', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 },
    );
  }
}
