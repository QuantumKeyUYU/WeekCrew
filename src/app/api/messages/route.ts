// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_MESSAGES_FETCH = 200;

// общая функция получения deviceId
function getDeviceId(req: NextRequest): string | null {
  const headerDeviceId = req.headers.get('x-device-id');
  const cookieDeviceId = req.cookies.get('deviceId')?.value;
  return headerDeviceId || cookieDeviceId || null;
}

// GET /api/messages?circleId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get('circleId');

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

    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'circle_not_found' },
        { status: 404 },
      );
    }

    const membership = await prisma.circleMembership.findFirst({
      where: {
        circleId,
        deviceId,
        status: 'active',
      },
    });

    if (!membership) {
      // для long-poll хука это нормальный кейс
      return NextResponse.json(
        { error: 'not_member' },
        { status: 403 },
      );
    }

    const messages = await prisma.message.findMany({
      where: { circleId },
      orderBy: { createdAt: 'asc' },
      take: MAX_MESSAGES_FETCH,
    });

    const memberCount = await prisma.circleMembership.count({
      where: { circleId, status: 'active' },
    });

    return NextResponse.json(
      {
        messages,
        quota: null,
        memberCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[api/messages][GET] failed', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 },
    );
  }
}

// POST /api/messages
export async function POST(req: NextRequest) {
  try {
    const deviceId = getDeviceId(req);
    if (!deviceId) {
      return NextResponse.json(
        { error: 'device_id_missing' },
        { status: 400 },
      );
    }

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

    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'circle_not_found' },
        { status: 404 },
      );
    }

    const now = new Date();
    if (circle.expiresAt.getTime() <= now.getTime()) {
      // фронт явно ждёт именно такой код и error
      return NextResponse.json(
        { error: 'circle_expired' },
        { status: 403 },
      );
    }

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

    // при желании можно прикрутить лимит, но пока просто создаём
    const message = await prisma.message.create({
      data: {
        circleId,
        deviceId,
        content,
        isSystem: false,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message,
        quota: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[api/messages][POST] failed', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 },
    );
  }
}
