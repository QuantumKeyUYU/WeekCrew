import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { AVATAR_PRESETS, DEFAULT_AVATAR_KEY } from '@/constants/avatars';
import { toUserProfile } from '@/lib/server/users';

const isValidAvatar = (key: string) => AVATAR_PRESETS.some((preset) => preset.key === key);

export async function GET(request: NextRequest) {
  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const user = await prisma.user.findUnique({ where: { deviceId } });
    const response = NextResponse.json({ user: user ? toUserProfile(user) : null });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('Failed to load profile', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim() : '';
  const avatarKey = typeof body?.avatarKey === 'string' ? body.avatarKey : DEFAULT_AVATAR_KEY;

  if (!nickname || nickname.length < 2 || nickname.length > 40) {
    return NextResponse.json({ error: 'INVALID_NICKNAME' }, { status: 400 });
  }

  const normalizedAvatar = isValidAvatar(avatarKey) ? avatarKey : DEFAULT_AVATAR_KEY;

  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);

    const user = await prisma.user.upsert({
      where: { deviceId },
      create: { deviceId, nickname, avatarKey: normalizedAvatar },
      update: { nickname, avatarKey: normalizedAvatar },
    });

    const response = NextResponse.json({ user: toUserProfile(user) });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('Failed to save profile', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
