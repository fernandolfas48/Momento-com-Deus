export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { isActive: true };
    if (category && category !== 'Todas') {
      where.category = category;
    }

    const songs = await prisma.song.findMany({ where, orderBy: { title: 'asc' } });
    return NextResponse.json({ songs });
  } catch (error: any) {
    console.error('Songs error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
