export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, premiumUsers, momentsToday, totalCreditsUsed] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'premium' } }),
      prisma.moment.count({ where: { completedAt: { gte: today } } }),
      prisma.aiUsageLog.aggregate({ _sum: { creditsUsed: true } }),
    ]);

    const activeToday = await prisma.event.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: today } },
    });
    const active7d = await prisma.event.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    const active30d = await prisma.event.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      momentsToday,
      totalCreditsUsed: totalCreditsUsed?._sum?.creditsUsed ?? 0,
      activeToday: activeToday?.length ?? 0,
      active7d: active7d?.length ?? 0,
      active30d: active30d?.length ?? 0,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
