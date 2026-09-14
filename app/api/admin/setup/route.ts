export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, secret } = body ?? {};
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 403 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    await prisma.user.update({ where: { email }, data: { role: 'admin' } });
    return NextResponse.json({ success: true, message: `${email} agora é admin.` });
  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
