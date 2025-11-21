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
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { deviceId } }),
      prisma.circleMembership.deleteMany({ where: { deviceId } }),
      prisma.device.deleteMany({ where: { id: deviceId } }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('device reset error', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
