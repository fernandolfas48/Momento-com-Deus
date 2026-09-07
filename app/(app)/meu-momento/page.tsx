'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, BookOpen, HandHeart, MessageCircle, Music, Loader2, Crown, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MeuMomentoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wasFree, setWasFree] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const user = session?.user as any;

  const createMoment = async () => {
    if (!message.trim()) { toast.error('Escreva algo sobre como você está se sentindo.'); return; }
    setLoading(true);
    setProgress(0);
    setResult(null);
    try {
      const res = await fetch('/api/ai/my-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: message, userName: user?.name }),
      });
      if (res.status === 403) {
        toast.error('Créditos insuficientes.');
        router.push('/premium');
        return;
      }
      if (!res.ok) throw new Error();
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let partialRead = '';
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split('\n');
        partialRead = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed?.status === 'processing') {
                setProgress((prev) => Math.min(prev + 3, 95));
              } else if (parsed?.status === 'completed') {
                setResult(parsed.result);
                setProgress(100);
                setWasFree(!!parsed.isFirstGeneration);
                // Paywall contextual: mostra o upsell logo após a primeira
                // experiência de valor, não como item solto de menu.
                if (user?.plan !== 'premium') {
                  setShowUpsell(true);
                }
              }
            } catch {}
          }
        }
      }
    } catch {
      toast.error('Erro ao gerar seu momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-display font-bold mb-1">Como está seu coração hoje?</h1>
      <p className="text-sm text-muted-foreground mb-5">Compartilhe o que você está sentindo e receba um momento personalizado.</p>

      {!result ? (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva livremente como você está se sentindo, o que está passando, seus pedidos ou agradecimentos..."
            className="w-full h-40 p-4 rounded-xl bg-white border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
          />

          {loading && (
            <div className="mt-4">
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#C9A84C] rounded-full" animate={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Gerando seu momento...</p>
            </div>
          )}

          <button
            onClick={createMoment}
            disabled={loading || !message.trim()}
            className="w-full mt-4 py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4" /> Criar meu momento</>}
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {user?.plan !== 'premium' ? 'Sua primeira geração é grátis ✨ · Depois, 2 créditos de IA' : 'Consome 2 créditos de IA'}
          </p>
        </>
      ) : (
        <div className="space-y-4">
          {result?.reflection && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="font-semibold text-sm">Reflexão</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.reflection}</p>
            </motion.div>
          )}

          {result?.bibleReference && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#C9A84C]/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="font-semibold text-sm">{result.bibleReference}</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed italic">{result?.bibleText}</p>
            </motion.div>
          )}

          {result?.prayer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-2">
                <HandHeart className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="font-semibold text-sm">Oração</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed italic">{result.prayer}</p>
            </motion.div>
          )}

          {result?.reflectionQuestion && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#C9A84C]/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="font-semibold text-sm">Para refletir</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.reflectionQuestion}</p>
            </motion.div>
          )}

          {result?.musicSuggestionCategory && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <button
                onClick={() => router.push(`/musica?category=${encodeURIComponent(result.musicSuggestionCategory)}`)}
                className="w-full py-3 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#C9A84C]/15"
              >
                <Music className="w-4 h-4" />
                Ouvir música: {result.musicSuggestionCategory}
              </button>
            </motion.div>
          )}

          {showUpsell && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative bg-gradient-to-br from-[#C9A84C]/15 to-[#C9A84C]/5 rounded-2xl p-5 border border-[#C9A84C]/20"
            >
              <button
                onClick={() => setShowUpsell(false)}
                aria-label="Fechar"
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="font-semibold text-sm">
                  {wasFree ? 'Gostou do seu primeiro momento?' : 'Continue essa jornada'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {wasFree
                  ? 'Essa geração foi por nossa conta. Com o Premium você tem momentos ilimitados com IA, todo dia.'
                  : 'Com o Premium você tem momentos ilimitados com IA e 50 créditos por mês.'}
              </p>
              <button
                onClick={() => router.push('/premium')}
                className="w-full py-2.5 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90"
              >
                <Sparkles className="w-4 h-4" /> Experimentar Premium grátis por 7 dias
              </button>
            </motion.div>
          )}

          <button onClick={() => { setResult(null); setMessage(''); setShowUpsell(false); }} className="w-full py-3 rounded-xl bg-white border border-border text-sm font-medium text-foreground hover:bg-muted">
            Novo momento
          </button>
        </div>
      )}
    </div>
  );
}
