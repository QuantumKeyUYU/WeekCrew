import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Убедитесь, что ваш prisma-клиент тут

// ---------------------------------------------------------------------
// 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Fix Foreign Key Constraint)
//    Мы добавили их прямо сюда, чтобы избежать проблем с импортом.
// ---------------------------------------------------------------------

/**
 * ГАРАНТИРУЕТ, что запись Device существует в базе данных.
 *
 * ВНИМАНИЕ: Здесь используется жестко заданный ID для тестирования.
 * В реальном приложении вы должны получать уникальный ID устройства из запроса (например, из cookie или заголовка).
 */
async function getOrCreateDevice(req: NextRequest) {
    // ВАЖНО: Замените это на получение реального ID устройства в вашем продакшене!
    const testDeviceId = "PERMANENT_TEST_DEVICE_ID_1"; 

    // Находит Device или создает его, если не существует
    const device = await prisma.device.upsert({
        where: { id: testDeviceId },
        update: {},
        create: { 
            id: testDeviceId,
        },
    });
    return device;
}

/**
 * Находит существующий Circle по Mood/Interest или создает новый, если не найден.
 * ГАРАНТИРУЕТ, что запись Circle существует в базе данных.
 */
async function findOrCreateCircle(mood: string, interest: string) {
    // 1. Попытаться найти активный круг по настроению и интересу
    let circle = await prisma.circle.findFirst({
        where: { mood, interest, status: 'active' },
    });

    // 2. Если подходящий круг не найден, создать новый
    if (!circle) {
        // Устанавливаем необходимые поля для создания нового Circle (согласно вашей схеме)
        circle = await prisma.circle.create({
            data: {
                mood,
                interest,
                maxMembers: 10, 
                startsAt: new Date(), 
                endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Круг на 24 часа
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Экспирация
            }
        });
    }
    return circle;
}


// ---------------------------------------------------------------------
// 2. ОСНОВНОЙ API-МАРШРУТ POST /api/circles/join
// ---------------------------------------------------------------------
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // 1. ГАРАНТИРУЕМ существование Device (Device ID теперь точно есть в БД)
        const device = await getOrCreateDevice(req); 
        const deviceId = device.id; 

        // 2. ГАРАНТИРУЕМ существование Circle (Circle ID теперь точно есть в БД)
        const circle = await findOrCreateCircle(body.mood, body.interest); 
        const circleId = circle.id; 

        // 3. Логика Membership (upsert, которая использует ваш @@unique)
        const membership = await prisma.circleMembership.upsert({
            where: { circleId_deviceId: { circleId, deviceId } },
            update: { status: 'active', leftAt: null }, // Обновляем, если уже был
            create: { circleId, deviceId, status: 'active' }, // Создаем, если новый
        });
        
        return NextResponse.json({ ok: true, circleId: circle.id, membershipId: membership.id });

    } catch (error: any) {
        // Вывод ошибки в Vercel Runtime Logs
        console.error('--- FATAL ERROR IN /api/circles/join ---');
        console.error(error);
        
        // Возвращаем 500 ошибку
        return NextResponse.json({ 
            ok: false, 
            error: 'Internal Server Error' 
        }, { status: 500 });
    }
}
