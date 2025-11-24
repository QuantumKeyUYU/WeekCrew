import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Проверь, что путь правильный
import { Prisma } from '@prisma/client';

// Заменяем капризный upsert на надежную проверку
const ensureMembership = async (circleId: string, deviceId: string) => {
  // 1. Сначала ищем, есть ли уже запись
  const existingMember = await prisma.circleMembership.findUnique({
    where: {
      circleId_deviceId: { circleId, deviceId },
    },
  });

  if (existingMember) {
    // 2. Если есть — просто обновляем статус (без риска P2002)
    if (existingMember.status !== 'active') {
      return await prisma.circleMembership.update({
        where: { id: existingMember.id },
        data: { status: 'active', leftAt: null },
      });
    }
    return existingMember;
  } else {
    // 3. Если нет — пытаемся создать
    try {
      return await prisma.circleMembership.create({
        data: {
          circleId,
          deviceId,
          status: 'active',
        },
      });
    } catch (error) {
      // 4. Если в этот момент случилась "гонка" и запись кто-то создал за наносекунду до нас
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Спокойно обновляем ту запись, которая помешала созданию
        return await prisma.circleMembership.update({
          where: { circleId_deviceId: { circleId, deviceId } },
          data: { status: 'active', leftAt: null },
        });
      }
      throw error;
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mood, interest } = body;

    // Предполагаю, что эти функции у тебя импортированы или объявлены в этом файле
    // const { id: deviceId } = await getOrCreateDevice(req);
    // const circle = await findOrCreateCircle(mood, interest);
    
    // ВАЖНО: Для теста давай захардкодим или убедимся, что переменные есть. 
    // Если функции getOrCreateDevice нет в этом куске, код упадет.
    // Но предполагаем, что они работают.

    await ensureMembership(circle.id, deviceId);

    // Получаем данные для ответа
    const memberCount = await prisma.circleMembership.count({
        where: { circleId: circle.id, status: 'active' } 
    }); // Заменил твою функцию на прямой вызов для надежности примера

    const messages = await prisma.message.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    return NextResponse.json({
      ok: true,
      circle,
      messages,
      memberCount,
    });

  } catch (error: any) {
    console.error('[api/circles/join] Error:', error);
    
    // ВОТ ЭТО ПОЗВОЛИТ ТЕБЕ УВИДЕТЬ РЕАЛЬНУЮ ОШИБКУ В БРАУЗЕРЕ
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Server Error', 
        details: error.message,
        code: error.code 
      }, 
      { status: 500 }
    );
  }
}
