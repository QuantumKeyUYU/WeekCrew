import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { findUserByDeviceId } from '@/lib/server/users';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const targetUserId = typeof body?.targetUserId === 'string' ? body.targetUserId : '';

  if (!targetUserId) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const { id: deviceId } = await getOrCreateDevice(request);
    const user = await findUserByDeviceId(deviceId);

    if (!user) {
      return NextResponse.json({ error: 'PROFILE_REQUIRED' }, { status: 400 });
    }

    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'SELF_BLOCK' }, { status: 400 });
    }

    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetUserId } },
      create: { blockerId: user.id, blockedId: targetUserId },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to block user', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
