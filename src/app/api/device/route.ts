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
      await tx.message.deleteMany({ where: { deviceId } });
      await tx.circleMembership.deleteMany({ where: { deviceId } });

      if (circleIds.length > 0) {
        const circlesWithMembers = await Promise.all(
          circleIds.map(async (circleId) => ({
            circleId,
            memberCount: await tx.circleMembership.count({
              where: { circleId, status: 'active' },
            }),
          })),
        );

        const emptyCircleIds = circlesWithMembers
          .filter((entry) => entry.memberCount === 0)
          .map((entry) => entry.circleId);

        if (emptyCircleIds.length > 0) {
          await tx.circle.deleteMany({ where: { id: { in: emptyCircleIds } } });
        }
      }

      await tx.device.deleteMany({ where: { id: deviceId } });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('device reset error', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
