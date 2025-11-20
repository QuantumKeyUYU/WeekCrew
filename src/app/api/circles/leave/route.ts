import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import {
  countActiveMembers,
  findLatestActiveMembershipForDevice,
  markMembershipLeft,
} from '@/lib/server/circleMembership';

export async function POST(request: NextRequest) {
  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const membership = await findLatestActiveMembershipForDevice(deviceId);

    if (!membership) {
      const response = NextResponse.json({ ok: true, circle: null });
      if (isNew) {
        response.headers.set(DEVICE_HEADER_NAME, deviceId);
      }
      return response;
    }

    await markMembershipLeft(membership.id);
    const memberCount = await countActiveMembers(membership.circleId);

    const response = NextResponse.json({
      ok: true,
      circle: null,
      prevCircleId: membership.circleId,
      memberCount,
    });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('leave error', error);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
