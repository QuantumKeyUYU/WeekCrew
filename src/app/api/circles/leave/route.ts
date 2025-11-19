import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { findLatestActiveMembershipForDevice } from '@/lib/server/circleMembership';

export async function POST(request: NextRequest) {
  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const membership = await findLatestActiveMembershipForDevice(deviceId);

    if (membership) {
      await prisma.circleMembership.update({
        where: { id: membership.id },
        data: { status: 'left', leftAt: new Date() },
      });
    }

    const response = NextResponse.json({ ok: true });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('Failed to leave circle', error);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
