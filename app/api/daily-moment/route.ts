export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getDailyTheme } from '@/lib/daily-themes';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const userId = (session.user as any).id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingMoment = await prisma.moment.findFirst({
      where: {
        userId,
        createdAt: { gte: today },
        completedAt: { not: null },
      },
    });

    const theme = getDailyTheme();
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return NextResponse.json({
      theme,
      completedToday: !!existingMoment,
      streak: user?.currentStreak ?? 0,
      dailyTime: user?.dailyTime ?? '5 minutos',
    });
  } catch (error: any) {
    console.error('Daily moment error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
