import { NextRequest, NextResponse } from "next/server";
import { appendMessage } from "@/server/circles";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const circleId = body?.circleId as string | undefined;
  const text = body?.body as string | undefined;
  const authorDeviceId = (body?.authorDeviceId as string | null) ?? null;

  if (!circleId || !text?.trim()) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  try {
    const message = await appendMessage({
      circleId,
      body: text.trim(),
      authorDeviceId,
    });

    return NextResponse.json({ ok: true, message }, { status: 201 });
  } catch (err: any) {
    const message = String(err?.message || "UNKNOWN_ERROR");
    const status = message.includes("LIVE_BACKEND_NOT_CONFIGURED") ? 503 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: "BACKEND_UNAVAILABLE",
        message,
      },
      { status }
    );
  }
}
