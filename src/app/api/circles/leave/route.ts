// src/app/api/circles/leave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { DEVICE_HEADER_NAME } from '@/lib/device';
import {
  countActiveMembers,
  findLatestActiveMembershipForDevice,
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

    await prisma.circleMembership.updateMany({
      where: { circleId: membership.circleId, deviceId, leftAt: null },
      data: { status: 'left', leftAt: new Date() },
    });

    const memberCount = await countActiveMembers(membership.circleId);
    console.info(`[LEAVE] Device ${deviceId} left circle ${membership.circleId}`);

    if (memberCount === 0) {
      await prisma.circle.update({
        where: { id: membership.circleId },
        data: { status: 'finished' },
      });
    }

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
    console.error('[api/circles/leave] error', error);
    return NextResponse.json(
      { ok: false as const, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
