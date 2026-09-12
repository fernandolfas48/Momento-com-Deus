export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkAndResetCredits } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const userId = (session.user as any).id;

    const user = await checkAndResetCredits(userId);
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const settings = await prisma.appSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;
    const cost = parseInt(settingsMap['prayer_credit_cost'] ?? '1', 10);

    if ((user.aiCredits ?? 0) < cost) {
      return NextResponse.json({ error: 'Créditos insuficientes', needsPremium: true }, { status: 403 });
    }

    const body = await request.json();
    const { topic, context, userName } = body ?? {};

    const prompt = `Você é um assistente espiritual cristão acolhedor. Gere uma oração personalizada em português brasileiro.\n\nNome do usuário: ${userName ?? 'irmão(a)'}\nTema: ${topic ?? 'geral'}\nContexto adicional: ${context ?? 'nenhum'}\n\nRegras:\n- Tom respeitoso, acolhedor e cristão\n- Não se apresente como Deus nem fale em nome de Deus\n- Não forneça aconselhamento médico, psicológico, financeiro ou jurídico\n- A oração deve ter entre 4-8 frases\n- Use linguagem simples e reconfortante\n\nGere apenas a oração, sem títulos ou explicações.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.8 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ error: 'Erro ao gerar oração' }, { status: 500 });
    }

    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();

    await prisma.user.update({
      where: { id: userId },
      data: { aiCredits: { decrement: cost } },
    });
    await prisma.aiUsageLog.create({
      data: { userId, actionType: 'prayer', creditsUsed: cost },
    });

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (error: any) {
    console.error('Generate prayer error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
