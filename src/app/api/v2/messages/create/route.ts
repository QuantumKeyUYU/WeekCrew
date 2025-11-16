import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { moderateText } from '@/lib/moderation';
import { DeviceHeaderError, getDeviceHashFromRequest } from '@/lib/request-device';
import type { MessageStatus } from '@/types';

const MIN_LENGTH = 10;
const MAX_LENGTH = 280;

const successCopy = {
  APPROVED: 'История сохранена. Она появится в подборке и кто-то сможет ответить письмом поддержки.',
  REJECTED: 'Мы не можем опубликовать эту историю. Попробуй сформулировать мысль чуть спокойнее.',
  PENDING: 'История принята и скоро появится в подборке.'
} as const satisfies Record<MessageStatus, string>;

export async function POST(request: NextRequest) {
  try {
    const deviceHash = getDeviceHashFromRequest(request);
    const payload = await request.json().catch(() => ({}));
    const rawBody = typeof payload?.body === 'string' ? payload.body : '';
    const body = rawBody.trim();

    if (body.length < MIN_LENGTH || body.length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `Текст должен быть от ${MIN_LENGTH} до ${MAX_LENGTH} символов.` },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        body,
        deviceHash,
        status: 'PENDING'
      }
    });

    const moderation = await moderateText(body);
    const finalStatus: MessageStatus = moderation.approved ? 'APPROVED' : 'REJECTED';

    await prisma.message.update({
      where: { id: message.id },
      data: { status: finalStatus }
    });

    return NextResponse.json({
      status: finalStatus.toLowerCase(),
      message: successCopy[finalStatus]
    });
  } catch (error) {
    if (error instanceof DeviceHeaderError) {
      return NextResponse.json({ error: 'Не удалось определить устройство.' }, { status: error.status });
    }
    console.error('[messages:create] failed', error);
    return NextResponse.json({ error: 'Сервер не ответил. Попробуй отправить историю чуть позже.' }, { status: 500 });
  }
}
