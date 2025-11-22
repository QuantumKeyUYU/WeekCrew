export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { addRealtimeSubscriber } from '@/lib/realtime';

const encoder = new TextEncoder();

const formatEvent = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel');

  if (!channel) {
    return NextResponse.json({ ok: false, error: 'MISSING_CHANNEL' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));

      send('retry: 5000\n\n');
      send(`: connected to ${channel}\n\n`);

      const unsubscribe = addRealtimeSubscriber(channel, (event, payload) => {
        send(formatEvent(event, payload));
      });

      const keepAlive = setInterval(() => {
        send(': keep-alive\n\n');
      }, 25000);

      const close = () => {
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      };

      request.signal.addEventListener('abort', close);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
