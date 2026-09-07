export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Playlist personalizada semanal.
// Importante: isso NÃO gera áudio novo por IA (custo e risco de qualidade altos
// para um app devocional). Em vez disso, a IA seleciona e organiza faixas já
// existentes na biblioteca curada, com base nos objetivos do usuário definidos
// no onboarding, trocando semanalmente (seed = ano + semana do ano).
function getWeekSeed(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

// Mapeia objetivos do onboarding para categorias de música existentes.
const goalToCategory: Record<string, string[]> = {
  'Ter mais paz': ['Paz'],
  'Superar ansiedade': ['Paz', 'Momentos difíceis'],
  'Desenvolver gratidão': ['Gratidão'],
  'Orar mais': ['Oração'],
  'Fortalecer minha fé': ['Adoração'],
  'Conhecer a Bíblia': ['Oração', 'Adoração'],
  'Cuidar da saúde emocional': ['Paz', 'Momentos difíceis'],
  'Criar uma rotina espiritual': ['Começar o dia', 'Antes de dormir'],
};

function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    if (user.plan !== 'premium') {
      return NextResponse.json({ locked: true, message: 'Playlist personalizada é um benefício Premium.' }, { status: 403 });
    }

    const weekSeed = getWeekSeed();
    const preferredCategories = new Set<string>();
    for (const g of user.goals ?? []) {
      (goalToCategory[g] ?? []).forEach((c) => preferredCategories.add(c));
    }
    if (preferredCategories.size === 0) preferredCategories.add('Paz');

    const allSongs = await prisma.song.findMany({ where: { isActive: true } });
    const preferred = allSongs.filter((s) => preferredCategories.has(s.category));
    const rest = allSongs.filter((s) => !preferredCategories.has(s.category));

    const playlist = seededShuffle([...preferred, ...rest], `${userId}-${weekSeed}`).slice(0, 5);

    return NextResponse.json({
      locked: false,
      weekLabel: weekSeed,
      categories: Array.from(preferredCategories),
      songs: playlist,
    });
  } catch (error: any) {
    console.error('Playlist error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
