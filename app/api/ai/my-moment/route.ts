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
    const baseCost = parseInt(settingsMap['my_moment_credit_cost'] ?? '2', 10);

    // Primeira geração é gratuita (teaser)
    const priorGenerations = await prisma.aiUsageLog.count({
      where: { userId, actionType: 'my_moment' },
    });
    const isFirstGeneration = priorGenerations === 0;
    const cost = isFirstGeneration ? 0 : baseCost;

    if ((user.aiCredits ?? 0) < cost) {
      return NextResponse.json({ error: 'Créditos insuficientes', needsPremium: true }, { status: 403 });
    }

    const body = await request.json();
    const { userMessage, userName } = body ?? {};

    const prompt = `Você é um assistente espiritual cristão acolhedor. O usuário ${userName ?? 'irmão(a)'} compartilhou o seguinte:\n\n"${userMessage}"\n\nCrie uma experiência espiritual personalizada. Responda em JSON com esta estrutura exata:\n{\n  "reflection": "Uma reflexão acolhedora de 3-5 frases",\n  "bibleReference": "Referência bíblica sugerida (ex: João 3:16)",\n  "bibleText": "O texto da passagem bíblica",\n  "prayer": "Uma oração personalizada de 4-6 frases",\n  "reflectionQuestion": "Uma pergunta para reflexão",\n  "musicSuggestionCategory": "Uma categoria: Oração, Paz, Gratidão, Adoração, Começar o dia, Antes de dormir ou Momentos difíceis"\n}\n\nRegras:\n- Tom cristão, respeitoso, acolhedor, não julgador\n- Português brasileiro\n- Não se apresente como Deus\n- Não forneça aconselhamento médico/psicológico/financeiro/jurídico\n\nResponda com raw JSON apenas. Sem code blocks ou markdown.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return NextResponse.json({ error: 'Erro ao gerar momento' }, { status: 500 });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? '';

    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      result = { reflection: text };
    }

    // Deduct credits (primeira geração é gratuita, cost = 0)
    if (cost > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { aiCredits: { decrement: cost } },
      });
    }
    await prisma.aiUsageLog.create({
      data: { userId, actionType: 'my_moment', creditsUsed: cost },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result, isFirstGeneration, creditsUsed: cost })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('My moment error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
