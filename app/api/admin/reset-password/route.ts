export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Rota temporária de reset de senha — remover após uso
export async function POST(request: Request) {
  try {
    const { email, newPassword, secret } = await request.json();
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 403 });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message) }, { status: 500 });
  }
}
