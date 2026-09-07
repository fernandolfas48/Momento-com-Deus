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

    // Primeira geração é gratuita (teaser), não consome créditos nem exige saldo.
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

    const prompt = `Você é um assistente espiritual cristão acolhedor. O usuário ${userName ?? 'irmão(a)'} compartilhou o seguinte:

"${userMessage}"

Crie uma experiência espiritual personalizada. Responda em JSON com esta estrutura exata:
{
  "reflection": "Uma reflexão acolhedora de 3-5 frases",
  "bibleReference": "Referência bíblica sugerida (ex: João 3:16)",
  "bibleText": "O texto da passagem bíblica",
  "prayer": "Uma oração personalizada de 4-6 frases",
  "reflectionQuestion": "Uma pergunta para reflexão",
  "musicSuggestionCategory": "Uma categoria: Oração, Paz, Gratidão, Adoração, Começar o dia, Antes de dormir ou Momentos difíceis"
}

Regras:
- Tom cristão, respeitoso, acolhedor, não julgador
- Português brasileiro
- Não se apresente como Deus
- Não forneça aconselhamento médico/psicológico/financeiro/jurídico

Responda com raw JSON apenas. Sem code blocks ou markdown.`;

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
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao gerar momento' }, { status: 500 });
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

    // Buffer JSON response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    let partialRead = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            partialRead += decoder.decode(value, { stream: true });
            const lines = partialRead.split('\n');
            partialRead = lines.pop() ?? '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer);
                    const finalData = JSON.stringify({ status: 'completed', result: finalResult, isFirstGeneration, creditsUsed: cost });
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                  } catch {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result: { reflection: buffer }, isFirstGeneration, creditsUsed: cost })}\n\n`));
                  }
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed?.choices?.[0]?.delta?.content ?? '';
                  const progressData = JSON.stringify({ status: 'processing', message: 'Gerando seu momento...' });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch {}
              }
            }
          }
          // If we get here without DONE
          if (buffer) {
            try {
              const finalResult = JSON.parse(buffer);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result: finalResult, isFirstGeneration, creditsUsed: cost })}\n\n`));
            } catch {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result: { reflection: buffer }, isFirstGeneration, creditsUsed: cost })}\n\n`));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Erro ao processar' })}\n\n`));
          controller.close();
        }
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
