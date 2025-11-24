import { NextRequest, NextResponse } from 'next/server';
import { isLiveBackendEnabled, prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { computeCircleExpiry, isCircleActive } from '@/lib/server/circles';
import {
  countActiveMembers,
  findLatestActiveMembershipForDevice,
  markMembershipLeft,
} from '@/lib/server/circleMembership';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import {
  toCircleMessage,
  toCircleSummary,
} from '@/lib/server/serializers';
import { Prisma } from '@prisma/client';

const MAX_MEMBERS_PER_CIRCLE = 8;

// Разбор тела запроса и валидация mood/interest
const parseJsonBody = (body: unknown) => {
  if (!body || typeof body !== 'object') return null;
  const { mood, interest } = body as { mood?: unknown; interest?: unknown };

  const normalizedMood =
    typeof mood === 'string' ? mood.trim() : '';
  const normalizedInterest =
    typeof interest === 'string' ? interest.trim() : '';

  if (!normalizedMood || !normalizedInterest) {
    return null;
  }

  return { mood: normalizedMood, interest: normalizedInterest };
};

// Безопасный upsert с обработкой P2002
const ensureActiveMembership = async (circleId: string, deviceId: string) => {
  try {
    return await prisma.circleMembership.upsert({
      where: { circleId_deviceId: { circleId, deviceId } },
      update: { status: 'active', leftAt: null },
      create: { circleId, deviceId, status: 'active' },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      console.warn(
        `[ensureActiveMembership] Conflict for ${circleId}/${deviceId}, retrying as update.`,
      );
      return await prisma.circleMembership.update({
        where: { circleId_deviceId: { circleId, deviceId } },
        data: { status: 'active', leftAt: null },
      });
    }
    throw error;
  }
};

// Поиск круга с местом
const findCircleWithSpace = async (mood: string, interest: string) => {
  const now = new Date();
  const candidates = await prisma.circle.findMany({
    where: { mood, interest, status: 'active', expiresAt: { gt: now } },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  for (const candidate of candidates) {
    const memberCount = await countActiveMembers(candidate.id);
    if (memberCount < candidate.maxMembers) {
      return { circle: candidate, memberCount } as const;
    }
  }

  return null;
};

// Создание нового круга
const createCircle = async (mood: string, interest: string) => {
  const startAt = new Date();
  const expiresAt = computeCircleExpiry(startAt);

  const circle = await prisma.circle.create({
    data: {
      mood,
      interest,
      status: 'active',
      maxMembers: MAX_MEMBERS_PER_CIRCLE,
      startAt,
      endAt: expiresAt,
      expiresAt,
    },
  });

  return { circle, memberCount: 0, isNewCircle: true as const };
};

// Основная функция
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = parseJsonBody(body);

    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: 'mood_and_interest_required' },
        { status: 400 },
      );
    }

    const { mood, interest } = parsed;
    const { id: deviceId, isNew } = await getOrCreateDevice(req);

    // Проверка активного участия
    const existingMembership = await findLatestActiveMembershipForDevice(
      deviceId,
      mood,
      interest,
    );

    let circle = existingMembership?.circle ?? null;
    let memberCount = 0;
    let isNewCircle = false;

    if (!circle) {
      const found = await findCircleWithSpace(mood, interest);
      if (found) {
        circle = found.circle;
        memberCount = found.memberCount;
      } else {
        const created = await createCircle(mood, interest);
        circle = created.circle;
        isNewCircle = true;
      }
    }

    // Обновление или создание участия
    await ensureActiveMembership(circle.id, deviceId);
    memberCount = await countActiveMembers(circle.id);

    // Формирование ответа
    const response = NextResponse.json(
      {
        ok: true as const,
        circle: toCircleSummary(circle, memberCount),
        messages: [],
        isNewCircle,
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
    console.error('[api/circles/join] failed', error);
    return NextResponse.json(
      { ok: false as const, error: 'internal_error' },
      { status: 500 },
    );
  }
}
