export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const formData = await request.formData();
    const audio = formData.get('audio') as File | null;
    if (!audio) return NextResponse.json({ error: 'Áudio não encontrado' }, { status: 400 });

    // Converte para base64
    const buffer = await audio.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = audio.type || 'audio/webm';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
              {
                text: 'Transcreva exatamente o que foi dito neste áudio em português brasileiro. Retorne apenas o texto transcrito, sem comentários, traduções ou explicações.',
              },
            ],
          }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Transcribe error:', err);
      return NextResponse.json({ error: 'Erro ao transcrever' }, { status: 500 });
    }

    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
