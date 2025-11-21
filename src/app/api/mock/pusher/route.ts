import { NextRequest, NextResponse } from 'next/server';
import { broadcastRealtimeEvent } from '@/lib/realtime';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const channel = typeof body?.channel === 'string' ? body.channel.trim() : '';
  const event = typeof body?.event === 'string' ? body.event.trim() : '';
  const payload = body?.payload ?? null;

  if (!channel || !event) {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  broadcastRealtimeEvent(channel, event, payload);
  return NextResponse.json({ ok: true });
}
