import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Убедитесь, что ваш prisma-клиент тут

// ---------------------------------------------------------------------
// 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ИСПРАВЛЯЮТ ОШИБКУ FOREIGN KEY)
// ---------------------------------------------------------------------

/**
 * ГАРАНТИРУЕТ, что запись Device существует в базе данных.
 * Используйте тут уникальный ID, например, из cookie или заголовка.
 */
async function getOrCreateDevice(req: NextRequest) {
    // ВНИМАНИЕ: Используйте уникальный ID. Я оставил тут тестовый ID.
    const testDeviceId = "PERMANENT_TEST_DEVICE_ID_1"; 

    // Находит Device или создает его
    const device = await prisma.device.upsert({
        where: { id: testDeviceId },
        update: {},
        create: { 
            id: testDeviceId,
            // Добавьте другие обязательные поля, если они есть в вашей модели Device
        },
    });
    return device;
}

/**
 * Находит существующий Circle или создает новый.
 * ГАРАНТИРУЕТ, что запись Circle существует в базе данных.
 */
async function findOrCreateCircle(mood: string, interest: string) {
    let circle = await prisma.circle.findFirst({
        where: { mood, interest, status: 'active' },
    });

    if (!circle) {
        // Устанавливаем все обязательные поля для создания нового Circle (см. schema.prisma)
        circle = await prisma.circle.create({
            data: {
                mood,
                interest,
                maxMembers: 10, 
                startsAt: new Date(), 
                endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), 
                // icebreaker заполнится дефолтным значением
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
        
        // 1. ГАРАНТИРУЕМ существование Device
        const device = await getOrCreateDevice(req); 
        const deviceId = device.id; 

        // 2. ГАРАНТИРУЕМ существование Circle
        const circle = await findOrCreateCircle(body.mood, body.interest); 
        const circleId = circle.id; 

        // 3. Логика Membership (использует два ID, которые теперь гарантированно существуют)
        const membership = await prisma.circleMembership.upsert({
            where: { circleId_deviceId: { circleId, deviceId } },
            update: { status: 'active', leftAt: null }, 
            create: { circleId, deviceId, status: 'active' }, 
        });
        
        return NextResponse.json({ ok: true, circleId: circle.id, membershipId: membership.id });

    } catch (error: any) {
        // Вывод ошибки для диагностики
        console.error('--- FATAL ERROR IN /api/circles/join ---');
        console.error(error);
        
        return NextResponse.json({ 
            ok: false, 
            error: 'Internal Server Error' 
        }, { status: 500 });
    }
}
