export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const { email, credits, operation } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    let newCredits: number;
    if (operation === 'set') {
      newCredits = credits;
    } else if (operation === 'add') {
      newCredits = (user.aiCredits ?? 0) + credits;
    } else {
      newCredits = Math.max(0, (user.aiCredits ?? 0) - credits);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { aiCredits: newCredits },
      select: { email: true, name: true, aiCredits: true },
    });
    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Credits error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
