// src/app/api/circles/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CIRCLE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_MAX_MEMBERS = 6;

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

    await prisma.device.upsert({
      where: { id: deviceId },
      update: {},
      create: { id: deviceId },
    });

    // ищем живой круг по настроению/интересу
    const existingCircle = await prisma.circle.findFirst({
      where: {
        mood,
        interest,
        status: 'active',
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'asc' },
    });

    let circle = existingCircle;
    let isNewCircle = false;

    if (!circle) {
      isNewCircle = true;
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
      });
    }

    // помечаем другие участия девайса как left
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

    // текущее участие в этом круге
    const existingMembership = await prisma.circleMembership.findFirst({
      where: {
        circleId: circle.id,
        deviceId,
      },
    });

    if (existingMembership) {
      await prisma.circleMembership.update({
        where: { id: existingMembership.id },
        data: { status: 'active', leftAt: null },
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

    // считаем активных участников
    const activeMembers = await prisma.circleMembership.count({
      where: {
        circleId: circle.id,
        status: 'active',
      },
    });

    const remainingMs = Math.max(circle.expiresAt.getTime() - Date.now(), 0);
    const isExpired =
      circle.status !== 'active' || circle.expiresAt.getTime() <= Date.now();

    const messages = await prisma.message.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json(
      {
        ok: true,
        isNewCircle,
        circle: {
          id: circle.id,
          mood: circle.mood,
          interest: circle.interest,
          status: circle.status,
          maxMembers: circle.maxMembers,
          startsAt: circle.startsAt,
          endsAt: circle.endsAt,
          expiresAt: circle.expiresAt,
          icebreaker: circle.icebreaker,
          createdAt: circle.createdAt,
          updatedAt: circle.updatedAt,
          memberCount: activeMembers,
          remainingMs,
          isExpired,
        },
        messages,
        quota: null,
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
