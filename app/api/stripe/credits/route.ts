export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Pacotes de créditos: definidos aqui, preços criados no Stripe
export const CREDIT_PACKAGES = [
  { id: 'credits_10', label: '10 créditos', credits: 10, priceBrl: 4.90, priceEnv: 'STRIPE_PRICE_CREDITS_10' },
  { id: 'credits_30', label: '30 créditos', credits: 30, priceBrl: 9.90, priceEnv: 'STRIPE_PRICE_CREDITS_30' },
  { id: 'credits_100', label: '100 créditos', credits: 100, priceBrl: 24.90, priceEnv: 'STRIPE_PRICE_CREDITS_100' },
];

export async function GET() {
  return NextResponse.json({ packages: CREDIT_PACKAGES });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;
    const { packageId } = await request.json();

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: 'Pacote inválido' }, { status: 400 });

    const priceId = process.env[pkg.priceEnv];
    if (!priceId) return NextResponse.json({ error: 'Pacote não configurado ainda' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    const appUrl = process.env.NEXTAUTH_URL ?? 'https://momento-com-deus.vercel.app';
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/creditos/sucesso?session_id={CHECKOUT_SESSION_ID}&credits=${pkg.credits}`,
      cancel_url: `${appUrl}/perfil`,
      metadata: { userId, credits: String(pkg.credits), type: 'credits' },
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Credits checkout error:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 });
  }
}
