export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id as string;

    const sub = await request.json();
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: 'Inscrição inválida' }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    await prisma.user.update({ where: { id: userId }, data: { notificationsEnabled: true } });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id as string;
    const { endpoint } = await request.json().catch(() => ({}));

    await prisma.pushSubscription.deleteMany({
      where: endpoint ? { endpoint, userId } : { userId },
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
