export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'VAPID keys não configuradas' }, { status: 500 });
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contato@example.com', publicKey, privateKey);

  const subs = await prisma.pushSubscription.findMany({
    where: { user: { notificationsEnabled: true } },
  });

  const payload = JSON.stringify({
    title: 'Momento com Deus',
    body: 'Seu momento de hoje está pronto. Reserve um instante com Deus.',
    url: '/home',
  });

  let sent = 0;
  let removed = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      sent++;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        removed++;
      } else {
        console.error('Push send error:', e?.statusCode, e?.body);
      }
    }
  }

  return NextResponse.json({ total: subs.length, sent, removed });
}
