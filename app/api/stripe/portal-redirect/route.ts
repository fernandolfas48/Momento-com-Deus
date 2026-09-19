export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const customerId = (user as any)?.stripeCustomerId;
  if (!customerId) redirect('/premium');

  const appUrl = process.env.NEXTAUTH_URL ?? 'https://momento-com-deus.vercel.app';
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/perfil`,
  });

  redirect(portalSession.url);
}
