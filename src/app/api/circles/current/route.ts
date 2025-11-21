export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { toCircleSummary } from '@/lib/server/serializers';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import {
  countActiveMembers,
  findLatestActiveMembershipForDevice,
} from '@/lib/server/circleMembership';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      return NextResponse.json({ circle: null, error: 'BACKEND_DISABLED' }, { status: 503 });
    }

    const { id: deviceId, isNew } = await getOrCreateDevice(request, prisma);
    const membership = await findLatestActiveMembershipForDevice(deviceId, prisma);

    if (!membership?.circle) {
      const response = NextResponse.json({ circle: null });
      if (isNew) {
        response.headers.set(DEVICE_HEADER_NAME, deviceId);
      }
      return response;
    }

    const memberCount = await countActiveMembers(membership.circle.id, prisma);
    const response = NextResponse.json({
      circle: toCircleSummary(membership.circle, memberCount),
    });
    if (isNew) {
      response.headers.set(DEVICE_HEADER_NAME, deviceId);
    }
    return response;
  } catch (error) {
    console.error('current circle error', error);
    return NextResponse.json({ circle: null }, { status: 500 });
  }
}
