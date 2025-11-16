import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'ok' });
  } catch (error) {
    console.error('[health] database unreachable', error);
    return NextResponse.json({ status: 'ok', database: 'error' });
  }
}
