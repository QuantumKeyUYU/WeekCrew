// src/app/api/circles/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const circleId = req.nextUrl.searchParams.get('circleId');

  if (!circleId) {
    return NextResponse.json(
      { ok: false as const, error: 'circle_id_required' },
      { status: 400 },
    );
  }

  try {
    const members = await prisma.circleMembership.findMany({
      where: { circleId, status: 'active', leftAt: null },
      select: { deviceId: true, joinedAt: true },
    });

    return NextResponse.json({ ok: true as const, members });
  } catch (error) {
    console.error('[api/circles/members] failed', error);
    return NextResponse.json(
      { ok: false as const, error: 'internal_error' },
      { status: 500 },
    );
  }
}

