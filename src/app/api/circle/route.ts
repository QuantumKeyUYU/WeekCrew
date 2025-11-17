import { NextRequest, NextResponse } from "next/server";
import { getCircleById, getOrCreateCircleByInterest } from "@/server/circles";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const interestId = searchParams.get("interestId");
  const circleId = searchParams.get("circleId");

  if (!interestId && !circleId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_QUERY" },
      { status: 400 }
    );
  }

  try {
    const circle = circleId
      ? await getCircleById(circleId)
      : await getOrCreateCircleByInterest(interestId!);

    if (!circle) {
      return NextResponse.json(
        { ok: false, error: "CIRCLE_NOT_FOUND" },
        { status: 404 }
      );
    }

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
