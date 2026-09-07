export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const totalMoments = await prisma.moment.count({ where: { userId, completedAt: { not: null } } });
    const totalReflections = await prisma.diaryEntry.count({ where: { userId, entryType: 'reflection' } });
    const totalPrayers = await prisma.diaryEntry.count({ where: { userId, entryType: 'prayer_request' } });

    const moments = await prisma.moment.findMany({
      where: { userId, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
      take: 90,
    });

    const completedDates = moments
      .filter((m: any) => m.completedAt)
      .map((m: any) => new Date(m.completedAt).toISOString().split('T')[0]);

    return NextResponse.json({
      streak: user?.currentStreak ?? 0,
      totalMoments,
      totalReflections,
      totalPrayers,
      completedDates,
      aiCredits: user?.aiCredits ?? 0,
      plan: user?.plan ?? 'free',
    });
  } catch (error: any) {
    console.error('Progress error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
