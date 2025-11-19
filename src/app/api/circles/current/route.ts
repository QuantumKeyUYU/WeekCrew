export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleSummary } from '@/lib/server/serializers';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import { findLatestActiveMembershipForDevice } from '@/lib/server/circleMembership';

const getCircleMemberCount = (circleId: string) =>
  prisma.circleMembership.count({ where: { circleId, status: 'active' } });

export async function GET(request: NextRequest) {
  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const membership = await findLatestActiveMembershipForDevice(deviceId);

    if (!membership?.circle) {
      const response = NextResponse.json({ circle: null });
      if (isNew) {
        response.headers.set(DEVICE_HEADER_NAME, deviceId);
      }
      return response;
    }

    const memberCount = await getCircleMemberCount(membership.circle.id);
    const response = NextResponse.json({
      circle: toCircleSummary(membership.circle, memberCount),
    });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('Failed to load current circle', error);
    return NextResponse.json({ circle: null }, { status: 500 });
  }
}
