export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const customerId = (user as any)?.stripeCustomerId;
    if (!customerId) return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 404 });

    const appUrl = process.env.NEXTAUTH_URL ?? 'https://momento-com-deus.vercel.app';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/perfil`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Erro ao abrir portal' }, { status: 500 });
  }
}
