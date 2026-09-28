export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Proxy de áudio — resolve o bloqueio de CORS do Google Drive
// O navegador acessa /api/audio?id=FILE_ID em vez do Drive diretamente
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Não autenticado', { status: 401 });

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    if (!fileId) return new Response('ID não informado', { status: 400 });

    // Tenta primeiro a URL de download direto do Google Drive
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MomentoComDeus/1.0)',
        'Accept': 'audio/*,*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new Response('Áudio não disponível', { status: 404 });
    }

    const contentType = response.headers.get('content-type') ?? 'audio/mpeg';
    const contentLength = response.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType.includes('audio') ? contentType : 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    };
    if (contentLength) headers['Content-Length'] = contentLength;

    return new Response(response.body, { status: 200, headers });
  } catch (error: any) {
    console.error('Audio proxy error:', error);
    return new Response('Erro ao carregar áudio', { status: 500 });
  }
}
