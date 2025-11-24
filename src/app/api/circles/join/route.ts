import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Убедись, что путь верный!

// --- ВРЕМЕННО ВСТАВЛЯЕМ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ПРЯМО СЮДА ---
// Чтобы исключить ошибку импорта. Если у тебя они сложные, оставь как есть,
// но убедись, что они не падают.

export async function POST(req: NextRequest) {
  console.log('--- START JOIN REQUEST ---'); // Метка в логах
  
  try {
    // 1. Читаем Body
    console.log('1. Reading body...');
    const body = await req.json();
    console.log('   Body received:', body);
    
    // 2. Ищем Device
    console.log('2. Calling getOrCreateDevice...');
    // ВАЖНО: Если getOrCreateDevice падает, мы увидим это в логах
    // Закомментируй свой импорт и проверь пока с хардкодом, чтобы исключить эту ошибку:
    // const { id: deviceId } = await getOrCreateDevice(req); 
    
    // ВРЕМЕННЫЙ ХАРДКОД ДЛЯ ТЕСТА (замени на свой реальный ID устройства из базы если знаешь, или оставь строку)
    const deviceId = "test-device-id-123"; 
    console.log('   DeviceId:', deviceId);

    // 3. Ищем Circle
    console.log('3. Calling findOrCreateCircle...');
    // const circle = await findOrCreateCircle(body.mood, body.interest);
    
    // ВРЕМЕННЫЙ ХАРДКОД ДЛЯ ТЕСТА (создадим круг на лету прямо тут)
    let circle = await prisma.circle.findFirst();
    if (!circle) {
       circle = await prisma.circle.create({ data: { name: 'Test Circle', mood: 'test', interest: 'test' }});
    }
    console.log('   CircleId:', circle.id);

    // 4. Логика Membership (то, что мы правили)
    console.log('4. Running ensureMembership...');
    
    const existingMember = await prisma.circleMembership.findUnique({
      where: { circleId_deviceId: { circleId: circle.id, deviceId } },
    });

    if (existingMember) {
       console.log('   Member exists, updating...');
       await prisma.circleMembership.update({
         where: { id: existingMember.id },
         data: { status: 'active', leftAt: null },
       });
    } else {
       console.log('   Member missing, creating...');
       await prisma.circleMembership.create({
         data: { circleId: circle.id, deviceId, status: 'active' },
       });
    }

    console.log('5. Success! Returning response.');
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    // Выводим ПОЛНЫЙ стек ошибки в консоль сервера
    console.error('!!! FATAL ERROR !!!');
    console.error(error);
    
    return NextResponse.json({ 
      ok: false, 
      error: String(error), 
      stack: error.stack 
    }, { status: 500 });
  }
}
