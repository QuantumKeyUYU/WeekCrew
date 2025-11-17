import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCircleByInterest } from "@/server/circles";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const interestId = searchParams.get("interestId");

  if (!interestId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_INTEREST_ID" },
      { status: 400 }
    );
  }

  try {
    const circle = await getOrCreateCircleByInterest(interestId);
    return NextResponse.json({ ok: true, circle });
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
