// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_BATCH = 100;

// Берём deviceId так же, как в /api/circles/join
function getDeviceId(req: NextRequest): string | null {
  return (
    req.headers.get('x-device-id') ||
    req.cookies.get('deviceId')?.value ||
    null
  );
}

// Приводим Prisma-сообщение к формату CircleMessage, который ждёт фронт
function mapMessage(message: any) {
  return {
    id: message.id,
    circleId: message.circleId,
    deviceId: message.deviceId ?? null,
    content: message.content,
    isSystem: message.isSystem ?? false,
    createdAt: message.createdAt.toISOString(),
    author: message.user
      ? {
          id: message.user.id,
          nickname: message.user.nickname,
          avatarKey: message.user.avatarKey,
        }
      : undefined,
  };
}

/**
 * GET /api/messages?circleId=...&cursor=ISO_DATE
 *
 * Возвращает сообщения круга:
 * - без проверки membership (никаких 403 больше)
 * - общие для всех устройств в этом круге
 * - инкрементально по cursor (long-poll hook это использует)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get('circleId');
    const cursor = searchParams.get('cursor');

    if (!circleId) {
      return NextResponse.json(
        { error: 'circle_id_required' },
        { status: 400 },
      );
    }

    let cursorDate: Date | null = null;
    if (cursor) {
      const d = new Date(cursor);
      if (!Number.isNaN(d.getTime())) {
        cursorDate = d;
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(cursorDate ? { createdAt: { gt: cursorDate } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_BATCH,
      include: {
        user: true,
      },
    });

    // количество активных участников в круге (для «1 участник / N участников»)
    const memberCount = await prisma.circleMembership.count({
      where: {
        circleId,
        status: 'active',
      },
    });

    const mapped = messages.map(mapMessage);

    const latestCursor =
      messages.length > 0
        ? messages[messages.length - 1].createdAt.toISOString()
        : cursor ?? null;

    return NextResponse.json(
      {
        messages: mapped,
        memberCount,
        cursor: latestCursor,
        notMember: false, // для совместимости с хуком
        quota: null, // квоту пока глушим
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

/**
 * POST /api/messages
 * body: { circleId: string; content: string }
 *
 * Отправка сообщения в круг.
 * Тоже без жёстких 403 — если есть circleId, пишем в него.
 */
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

    const message = await prisma.message.create({
      data: {
        circleId,
        content,
        isSystem: false,
        deviceId: deviceId ?? undefined,
        // userId подтягивается на фронте через профиль, если нужно —
        // здесь не трогаем
      },
      include: {
        user: true,
      },
    });

    const mapped = mapMessage(message);

    return NextResponse.json(
      {
        message: mapped,
        quota: null,
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
