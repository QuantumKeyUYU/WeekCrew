import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getOrCreateDevice } from '@/lib/server/device';
import { findUserByDeviceId } from '@/lib/server/users';
import { isDeviceCircleMember } from '@/lib/server/circleMembership';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const targetUserId = typeof body?.targetUserId === 'string' ? body.targetUserId : '';
  const circleId = typeof body?.circleId === 'string' ? body.circleId : '';
  const messageId = typeof body?.messageId === 'string' ? body.messageId : null;
  const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'abuse';

  if (!targetUserId || !circleId) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      return NextResponse.json({ error: 'BACKEND_DISABLED' }, { status: 503 });
    }

    const { id: deviceId } = await getOrCreateDevice(request, prisma);
    const reporter = await findUserByDeviceId(deviceId);

    if (!reporter) {
      return NextResponse.json({ error: 'PROFILE_REQUIRED' }, { status: 400 });
    }

    const canReport = await isDeviceCircleMember(circleId, deviceId, prisma);
    if (!canReport) {
      return NextResponse.json({ error: 'NOT_ALLOWED' }, { status: 403 });
    }

    if (reporter.id === targetUserId) {
      return NextResponse.json({ error: 'SELF_REPORT' }, { status: 400 });
    }

    const targetExists = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetExists) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    await prisma.report.create({
      data: {
        reporterId: reporter.id,
        targetId: targetUserId,
        circleId,
        messageId,
        reason,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('report error', error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
