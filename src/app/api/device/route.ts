import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';

export async function DELETE(request: NextRequest) {
  const { device, id: deviceId, isNew } = await getOrCreateDevice(request);

  if (isNew) {
    if (device) {
      await prisma.device.deleteMany({ where: { id: deviceId } });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const memberships = await prisma.circleMembership.findMany({
      where: { deviceId },
      select: { circleId: true },
    });

    const circleIds = [...new Set(memberships.map((membership) => membership.circleId))];

    await prisma.$transaction(async (tx) => {
      if (circleIds.length > 0) {
        await tx.message.deleteMany({ where: { circleId: { in: circleIds } } });
        await tx.circleMembership.deleteMany({ where: { circleId: { in: circleIds } } });
        await tx.circle.deleteMany({ where: { id: { in: circleIds } } });
      }

      await tx.device.deleteMany({ where: { id: deviceId } });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('device reset error', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
