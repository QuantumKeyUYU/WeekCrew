import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { getOrCreateDevice } from '@/server/device';
import { toCircleSummary } from '@/server/serializers';
import { DEVICE_HEADER_NAME } from '@/lib/device';

const getCircleMemberCount = (circleId: string) =>
  prisma.circleMembership.count({ where: { circleId, status: 'active' } });

export async function GET(request: NextRequest) {
  try {
    const { id: deviceId, isNew } = await getOrCreateDevice(request);
    const membership = await prisma.circleMembership.findFirst({
      where: {
        deviceId,
        status: 'active',
        circle: {
          status: 'active',
          endsAt: { gt: new Date() },
        },
      },
      include: { circle: true },
    });

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
