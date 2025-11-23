// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const POLL_DELAY_MS = 2500; // небольшая пауза для поллинга, чтобы не спамить
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function getDeviceId(req: NextRequest): string | null {
  const headerDeviceId = req.headers.get('x-device-id') ?? undefined;
  const cookieDeviceId = req.cookies.get('deviceId')?.value ?? undefined;
  return headerDeviceId || cookieDeviceId || null;
}

// GET /api/messages?circleId=...&since=...&limit=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get('circleId');
    const sinceParam = searchParams.get('since');
    const limitParam = searchParams.get('limit');

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

    // Проверяем, что девайс сейчас в этом круге
    const membership = await prisma.circleMembership.findFirst({
      where: {
        circleId,
        deviceId,
        status: 'active',
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'not_member' },
        { status: 403 },
      );
    }

    let since: Date | null = null;
    if (sinceParam) {
      const parsed = new Date(sinceParam);
      if (!Number.isNaN(parsed.getTime())) {
        since = parsed;
      }
    }

    let limit = DEFAULT_LIMIT;
    if (limitParam) {
      const parsedLimit = Number(limitParam);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, MAX_LIMIT);
      }
    }

    // Тормозим **только** поллинговые запросы (когда есть since),
    // чтобы не было 1000 запросов в минуту и мигающего индикатора.
    if (since) {
      await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
    }

    const where: Record<string, any> = { circleId };
    if (since) {
      where.createdAt = { gt: since };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    // quota и memberCount фронт умеет считать опциональными, так что просто шлём quota: null
    return NextResponse.json(
      {
        messages,
        quota: null,
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

// POST /api/messages  — отправка сообщения
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { circleId?: string; content?: string }
      | null;

    const circleId = body?.circleId?.trim();
    const rawContent = body?.content ?? '';
    const content = rawContent.trim();

    if (!circleId || !content) {
      return NextResponse.json(
        { error: 'circle_and_content_required' },
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

    const now = new Date();
    if (circle.expiresAt <= now || circle.status !== 'active') {
      return NextResponse.json(
        { error: 'circle_expired' },
        { status: 403 },
      );
    }

    // Ещё раз проверим membership на всякий
    const membership = await prisma.circleMembership.findFirst({
      where: {
        circleId,
        deviceId,
        status: 'active',
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'not_member' },
        { status: 403 },
      );
    }

    // Профиль юзера (через deviceId)
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
        ok: true,
        message,
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
