// src/app/api/circles/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // если путь другой — поправь импорт

// 7 суток в мс — срок жизни круга по умолчанию
const CIRCLE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_MAX_MEMBERS = 6;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as
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

    // DeviceId — из заголовка и/или куки. Под это обычно заточен клиент.
    const headerDeviceId = req.headers.get('x-device-id') ?? undefined;
    const cookieDeviceId = req.cookies.get('deviceId')?.value ?? undefined;
    const deviceId = headerDeviceId || cookieDeviceId;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'device_id_missing' },
        { status: 400 },
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CIRCLE_LIFETIME_MS);

    // Убедимся, что Device существует (на случай, если /api/device не вызывался)
    await prisma.device.upsert({
      where: { id: deviceId },
      update: {},
      create: { id: deviceId },
    });

    // Ищем существующий активный круг по настроению/интересу,
    // не истёкший и не переполненный
    const existingCircle = await prisma.circle.findFirst({
      where: {
        mood,
        interest,
        status: 'active',
        expiresAt: { gt: now },
      },
      include: {
        memberships: {
          where: { status: 'active' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let circle = existingCircle as
      | (typeof existingCircle & { memberships: { id: string }[] })
      | null;

    if (circle && circle.memberships.length >= circle.maxMembers) {
      circle = null;
    }

    // Если нормального круга нет — создаём новый
    if (!circle) {
      circle = await prisma.circle.create({
        data: {
          mood,
          interest,
          status: 'active',
          maxMembers: DEFAULT_MAX_MEMBERS,
          startsAt: now,
          endsAt: expiresAt,
          expiresAt,
        },
        include: {
          memberships: {
            where: { status: 'active' },
            select: { id: true },
          },
        },
      });
    }

    // На всякий случай пометим старые активные участия этого девайса как left
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

    // Записываем участие в выбранном круге (если уже вступали — просто оставим как есть)
    await prisma.circleMembership.upsert({
      where: {
        // уникального индекса нет, поэтому используем искусственный композитный
        // через @@index не получится — так что делаем через id/комбинацию:
        // найдём первую запись, если есть, иначе создадим.
        // Хак через composite key: circleId+deviceId
        // Решим так: попробуем найти, потом create/update ниже.
        id: await (async () => {
          const existingMembership = await prisma.circleMembership.findFirst({
            where: {
              circleId: circle!.id,
              deviceId,
            },
          });

          return existingMembership?.id ?? `temp-${deviceId}-${circle!.id}`;
        })(),
      },
      update: {
        status: 'active',
        leftAt: null,
      },
      create: {
        circleId: circle.id,
        deviceId,
        status: 'active',
      },
    });

    // Сообщения круга (берём последние 100, чтобы что-то показать, если круг не новый)
    const messages = await prisma.message.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    // Доп. поле remainingMs — фронт может подсосать его сразу
    const remainingMs = Math.max(circle.expiresAt.getTime() - Date.now(), 0);

    return NextResponse.json(
      {
        circle: {
          ...circle,
          // Prisma не знает про дополнительное поле, но фронту удобно
          remainingMs,
        },
        messages,
        quota: null as unknown as null, // для совместимости если где-то ждут quota
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
