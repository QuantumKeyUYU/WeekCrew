import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeviceHeaderError, getDeviceHashFromRequest } from '@/lib/request-device';

export async function GET(request: NextRequest) {
  try {
    const deviceHash = getDeviceHashFromRequest(request);
    const responded = await prisma.response.findMany({
      where: { deviceHash },
      select: { messageId: true }
    });
    const skipIds = responded.map((item) => item.messageId);

    const eligibleWhere = {
      status: 'APPROVED' as const,
      ...(skipIds.length ? { id: { notIn: skipIds } } : {})
    };

    const total = await prisma.message.count({ where: eligibleWhere });
    if (total === 0) {
      return NextResponse.json({ message: null });
    }
    const offset = Math.max(0, Math.floor(Math.random() * total));

    const message = await prisma.message.findFirst({
      where: eligibleWhere,
      orderBy: { createdAt: 'desc' },
      skip: offset
    });

    if (!message) {
      return NextResponse.json({ message: null });
    }

    return NextResponse.json({
      message: {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        status: message.status
      }
    });
  } catch (error) {
    if (error instanceof DeviceHeaderError) {
      return NextResponse.json({ error: 'Не удалось определить устройство.' }, { status: error.status });
    }
    console.error('[messages:random] failed', error);
    return NextResponse.json({ error: 'Не получилось загрузить истории.' }, { status: 500 });
  }
}
