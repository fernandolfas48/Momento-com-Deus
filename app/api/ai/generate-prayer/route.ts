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

    const prompt = `Você é um assistente espiritual cristão acolhedor. Gere uma oração personalizada em português brasileiro.

Nome do usuário: ${userName ?? 'irmão(a)'}
Tema: ${topic ?? 'geral'}
Contexto adicional: ${context ?? 'nenhum'}

Regras:
- Tom respeitoso, acolhedor e cristao
- Não se apresente como Deus nem fale em nome de Deus
- Não forneça aconselhamento médico, psicológico, financeiro ou jurídico
- A oração deve ter entre 4-8 frases
- Use linguagem simples e reconfortante

Gere apenas a oração, sem títulos ou explicações.`;

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao gerar oração' }, { status: 500 });
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { aiCredits: { decrement: cost } },
    });
    await prisma.aiUsageLog.create({
      data: { userId, actionType: 'prayer', creditsUsed: cost },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Generate prayer error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
