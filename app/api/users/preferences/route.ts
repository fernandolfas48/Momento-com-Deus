export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;
    const body = await request.json();

    const data: any = {};
    if (body.dailyTime !== undefined) data.dailyTime = body.dailyTime;
    if (body.goals !== undefined) data.goals = body.goals;
    if (body.frequency !== undefined) data.frequency = body.frequency;
    if (body.preferredTime !== undefined) data.preferredTime = body.preferredTime;
    if (body.onboardingCompleted !== undefined) data.onboardingCompleted = body.onboardingCompleted;
    if (body.notificationsEnabled !== undefined) data.notificationsEnabled = body.notificationsEnabled;
    if (body.name !== undefined) data.name = body.name;

    const user = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ user: { id: user.id, name: user.name, onboardingCompleted: user.onboardingCompleted } });
  } catch (error: any) {
    console.error('Preferences error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
