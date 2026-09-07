export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') ?? 'all';

    const where: any = { userId };
    if (filter !== 'all') {
      where.entryType = filter;
    }

    const entries = await prisma.diaryEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error('Diary error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;
    const body = await request.json();

    const entry = await prisma.diaryEntry.create({
      data: {
        userId,
        content: body.content,
        entryType: body.entryType ?? 'reflection',
        mood: body.mood,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error('Diary create error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
