import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeviceHeaderError, getDeviceHashFromRequest } from '@/lib/request-device';

export async function GET(request: NextRequest) {
  try {
    const deviceHash = getDeviceHashFromRequest(request);

    const [received, replied] = await Promise.all([
      prisma.message.findMany({
        where: { deviceHash, status: 'APPROVED', replies: { some: {} } },
        include: {
          replies: { orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.response.findMany({
        where: { deviceHash },
        include: { message: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return NextResponse.json({
      received: received.map((message) => ({
        id: message.id,
        body: message.body,
        status: message.status,
        createdAt: message.createdAt.toISOString(),
        replies: message.replies.map((reply) => ({
          id: reply.id,
          body: reply.body,
          messageId: reply.messageId,
          createdAt: reply.createdAt.toISOString()
        }))
      })),
      replied: replied.map((response) => ({
        id: response.id,
        body: response.body,
        createdAt: response.createdAt.toISOString(),
        message: {
          id: response.message.id,
          body: response.message.body,
          status: response.message.status,
          createdAt: response.message.createdAt.toISOString()
        }
      }))
    });
  } catch (error) {
    if (error instanceof DeviceHeaderError) {
      return NextResponse.json({ error: 'Не удалось определить устройство.' }, { status: error.status });
    }
    console.error('[my] failed', error);
    return NextResponse.json({ error: 'Не получилось загрузить письма.' }, { status: 500 });
  }
}
