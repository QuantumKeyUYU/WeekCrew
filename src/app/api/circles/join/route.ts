// src/app/api/circles/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CIRCLE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней
const DEFAULT_MAX_MEMBERS = 6;

function getDeviceId(req: NextRequest): string | null {
  const headerDeviceId = req.headers.get('x-device-id') ?? undefined;
  const cookieDeviceId = req.cookies.get('deviceId')?.value ?? undefined;
  return headerDeviceId || cookieDeviceId || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { mood?: string; interest?: string }
      | null;

    const mood = body?.mood?.trim();
    const interest = body?.interest?.trim();

    if (!mood || !interest) {
      return NextResponse.json(
        { error: 'mood_and_interest_required' },
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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CIRCLE_LIFETIME_MS);

    // Гарантируем наличие Device
    await prisma.device.upsert({
      where: { id: deviceId },
      update: {},
      create: { id: deviceId },
    });

    // ✅ ВСЕГДА создаём новый круг — никаких шарингов по настроению/интересу
    const circle = await prisma.circle.create({
      data: {
        mood,
        interest,
        status: 'active',
        maxMembers: DEFAULT_MAX_MEMBERS,
        startsAt: now,
        endsAt: expiresAt,
        expiresAt,
      },
    });

    // Помечаем старые активные участия этого девайса как left
    await prisma.circleMembership.updateMany({
      where: {
        deviceId,
        status: 'active',
        circleId: { not: circle.id },
      },
      data: {
        status: 'left',
        leftAt: now,
      },
    });

    // Создаём (или обновляем) участие в НОВОМ круге
    const existingMembership = await prisma.circleMembership.findFirst({
      where: {
        circleId: circle.id,
        deviceId,
      },
    });

    if (existingMembership) {
      await prisma.circleMembership.update({
        where: { id: existingMembership.id },
        data: {
          status: 'active',
          leftAt: null,
        },
      });
    } else {
      await prisma.circleMembership.create({
        data: {
          circleId: circle.id,
          deviceId,
          status: 'active',
        },
      });
    }

    // Новый круг – сообщений пока нет, но на будущее оставляем
    const messages = await prisma.message.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    const remainingMs = Math.max(circle.expiresAt.getTime() - Date.now(), 0);

    return NextResponse.json(
      {
        circle: {
          ...circle,
          remainingMs,
        },
        messages,
        quota: null as const,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[api/circles/join] failed', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 },
    );
  }
}
