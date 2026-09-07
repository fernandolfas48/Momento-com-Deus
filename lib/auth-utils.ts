import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; name: string; email: string; role: string; plan: string; onboardingCompleted: boolean };
}

export async function getFullUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function checkAndResetCredits(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const now = new Date();
  const resetAt = user.aiCreditsResetAt;
  if (!resetAt || now.getTime() - resetAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
    const settings = await prisma.appSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;
    const maxCredits = user.plan === 'premium'
      ? parseInt(settingsMap['premium_ai_credits'] ?? '50', 10)
      : parseInt(settingsMap['free_ai_credits'] ?? '3', 10);
    await prisma.user.update({
      where: { id: userId },
      data: { aiCredits: maxCredits, aiCreditsResetAt: now },
    });
    return { ...user, aiCredits: maxCredits };
  }
  return user;
}
