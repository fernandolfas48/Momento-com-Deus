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
    const songs = await prisma.song.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ songs });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const body = await request.json();
    const song = await prisma.song.create({
      data: {
        title: body.title,
        artist: body.artist,
        category: body.category,
        coverUrl: body.coverUrl,
        audioUrl: body.audioUrl,
        durationSeconds: body.durationSeconds ? parseInt(body.durationSeconds, 10) : null,
        isFree: body.isFree ?? true,
        isActive: true,
      },
    });
    return NextResponse.json({ song }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const body = await request.json();
    const { id, ...data } = body ?? {};
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    const song = await prisma.song.update({ where: { id }, data });
    return NextResponse.json({ song });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
