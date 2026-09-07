export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;
    const body = await request.json();

    const moment = await prisma.moment.create({
      data: {
        userId,
        theme: body.theme,
        bibleReference: body.bibleReference,
        bibleText: body.bibleText,
        reflection: body.reflection,
        prayer: body.prayer,
        userReflection: body.userReflection,
        mood: body.mood,
        durationMinutes: body.durationMinutes,
        completedAt: new Date(),
      },
    });

    // Update streak
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const now = new Date();
    let newStreak = 1;
    if (user?.lastMomentAt) {
      const lastDate = new Date(user.lastMomentAt);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        newStreak = (user.currentStreak ?? 0) + 1;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: newStreak, lastMomentAt: now },
    });

    // Save diary entry
    if (body.userReflection) {
      await prisma.diaryEntry.create({
        data: {
          userId,
          content: body.userReflection,
          entryType: 'reflection',
          momentId: moment.id,
          mood: body.mood,
        },
      });
    }

    // Log event
    await prisma.event.create({
      data: { userId, eventType: 'moment_completed', metadata: JSON.stringify({ momentId: moment.id }) },
    });

    return NextResponse.json({ moment, streak: newStreak });
  } catch (error: any) {
    console.error('Moment create error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
