import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeviceHeaderError, getDeviceHashFromRequest } from '@/lib/request-device';

const MIN_LENGTH = 10;
const MAX_LENGTH = 400;

export async function POST(request: NextRequest) {
  try {
    const deviceHash = getDeviceHashFromRequest(request);
    const payload = await request.json().catch(() => ({}));
    const messageId = typeof payload?.messageId === 'string' ? payload.messageId : '';
    const rawBody = typeof payload?.body === 'string' ? payload.body : '';
    const body = rawBody.trim();

    if (!messageId) {
      return NextResponse.json({ error: 'Не нашли историю для ответа.' }, { status: 400 });
    }

    if (body.length < MIN_LENGTH || body.length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `Ответ должен быть от ${MIN_LENGTH} до ${MAX_LENGTH} символов.` },
        { status: 400 }
      );
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Эта история недоступна для ответов.' }, { status: 404 });
    }

    const alreadyReplied = await prisma.response.findFirst({ where: { messageId, deviceHash } });
    if (alreadyReplied) {
      return NextResponse.json({ error: 'С этого устройства уже есть ответ на эту историю.' }, { status: 409 });
    }

    await prisma.response.create({
      data: {
        body,
        messageId,
        deviceHash
      }
    });

    return NextResponse.json({
      status: 'ok',
      message: 'Спасибо! Твоё письмо поддержки отправлено автору.'
    });
  } catch (error) {
    if (error instanceof DeviceHeaderError) {
      return NextResponse.json({ error: 'Не удалось определить устройство.' }, { status: error.status });
    }
    console.error('[responses:create] failed', error);
    return NextResponse.json({ error: 'Сервер не ответил. Попробуй ещё раз.' }, { status: 500 });
  }
}
