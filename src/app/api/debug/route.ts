import { NextResponse } from "next/server";
import { dbStatus } from "@/server/db";

export async function GET() {
  const mode = process.env.NEXT_PUBLIC_WEEKCREW_MODE || "demo";

  return NextResponse.json({
    ok: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      WEEKCREW_MODE: mode,
    },
    backend: {
      dbStatus,
    },
    timestamp: Date.now(),
  });
}
