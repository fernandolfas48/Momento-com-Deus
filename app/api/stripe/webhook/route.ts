export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId) break;

        // Compra de créditos avulsos
        if (session.metadata?.type === 'credits') {
          const credits = parseInt(session.metadata?.credits ?? '0');
          if (credits > 0) {
            await prisma.user.update({
              where: { id: userId },
              data: { aiCredits: { increment: credits } },
            });
          }
          break;
        }

        // Assinatura Premium
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'premium',
            aiCredits: { increment: 50 },
            stripeCustomerId: session.customer,
          },
        });
        await prisma.subscription.create({
          data: {
            userId,
            plan: session.metadata?.plan ?? 'monthly',
            status: 'active',
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
          },
        });
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer as string) as any;
        const userId = customer.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: { plan: 'free' },
        });
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'cancelled' },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer as string) as any;
        const userId = customer.metadata?.userId;
        if (!userId) break;
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        await prisma.user.update({
          where: { id: userId },
          data: { plan: isActive ? 'premium' : 'free' },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer as string) as any;
        const userId = customer.metadata?.userId;
        if (!userId) break;
        console.warn(`Pagamento falhou para userId: ${userId}`);
        break;
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
