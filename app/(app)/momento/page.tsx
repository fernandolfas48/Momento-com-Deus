'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, HandHeart, Heart, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const prayerTopics = ['Ansiedade', 'Família', 'Trabalho', 'Estudos', 'Relacionamentos', 'Finanças', 'Gratidão', 'Medo', 'Decisões', 'Saúde emocional'];
const moodOptions = ['Em paz', 'Agradecido', 'Esperançoso', 'Preocupado', 'Triste', 'Motivado'];

export default function MomentoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [themeData, setThemeData] = useState<any>(null);
  const [userReflection, setUserReflection] = useState('');
  const [mood, setMood] = useState('');
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [prayerTopic, setPrayerTopic] = useState('');
  const [generatingPrayer, setGeneratingPrayer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [streak, setStreak] = useState(0);
  const user = session?.user as any;

  useEffect(() => {
    fetch('/api/daily-moment')
      .then((r) => r.json())
      .then((d) => { setThemeData(d?.theme); setStreak(d?.streak ?? 0); })
      .catch(() => {});
  }, []);

  const generatePrayer = async () => {
    if (!prayerTopic) { toast.error('Selecione um tema.'); return; }
    setGeneratingPrayer(true);
    setGeneratedPrayer('');
    try {
      const res = await fetch('/api/ai/generate-prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: prayerTopic, userName: user?.name }),
      });
      if (res.status === 403) {
        toast.error('Créditos insuficientes.');
        router.push('/premium');
        return;
      }
      if (!res.ok) throw new Error();
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';
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
              const content = parsed?.choices?.[0]?.delta?.content ?? '';
              text += content;
              setGeneratedPrayer(text);
            } catch {}
          }
        }
      }
      if (!text) setGeneratedPrayer('Oração gerada com sucesso.');
    } catch {
      toast.error('Erro ao gerar oração.');
    } finally {
      setGeneratingPrayer(false);
    }
  };

  const completeMoment = async () => {
    if (!mood) { toast.error('Selecione como você está se sentindo.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeData?.theme,
          bibleReference: themeData?.bibleReference,
          bibleText: themeData?.bibleText,
          reflection: themeData?.reflection,
          prayer: generatedPrayer || themeData?.prayer,
          userReflection,
          mood,
          durationMinutes: 5,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStreak(data?.streak ?? streak + 1);
      setStep(4);
    } catch {
      toast.error('Erro ao salvar momento.');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { icon: BookOpen, label: 'Palavra' },
    { icon: MessageCircle, label: 'Reflexão' },
    { icon: HandHeart, label: 'Oração' },
    { icon: Heart, label: 'Encerramento' },
  ];

  return (
    <div className="px-5 pt-6">
      {/* Progress steps */}
      {step < 4 && (
        <div className="flex items-center gap-1 mb-6">
          {steps.map((s, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-[#C9A84C]' : 'bg-border'}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

          {/* Step 0 - Palavra */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-display font-bold mb-1">Palavra de hoje</h2>
              <p className="text-xs text-[#C9A84C] font-medium mb-4">{themeData?.theme}</p>
              <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-sm font-semibold text-[#C9A84C] mb-2">{themeData?.bibleReference}</p>
                <p className="text-sm text-foreground leading-relaxed italic">“{themeData?.bibleText}”</p>
              </div>
              <div className="bg-[#C9A84C]/5 rounded-2xl p-4 mb-6">
                <p className="text-sm text-foreground leading-relaxed">{themeData?.reflection}</p>
              </div>
              <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1 - Reflexão */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-display font-bold mb-1">Reflita</h2>
              <p className="text-sm text-muted-foreground mb-4">O que essa mensagem significa para você hoje?</p>
              <textarea
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
                placeholder="Escreva sua reflexão aqui... (opcional)"
                className="w-full h-32 p-4 rounded-xl bg-white border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
              />
              <button onClick={() => setStep(2)} className="w-full mt-4 py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2 - Oração */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-display font-bold mb-1">Seu momento de oração</h2>
              <p className="text-sm text-muted-foreground mb-4">Você pode fazer esta oração em silêncio ou em voz alta.</p>
              <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-sm text-foreground leading-relaxed italic">{generatedPrayer || themeData?.prayer}</p>
              </div>

              {!generatedPrayer && (
                <div className="mb-4">
                  <button
                    onClick={() => setPrayerTopic(prayerTopic ? '' : 'open')}
                    className="w-full py-2.5 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#C9A84C]/15"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gerar oração personalizada
                  </button>
                  {prayerTopic === 'open' && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Selecione um tema:</p>
                      <div className="flex flex-wrap gap-2">
                        {prayerTopics.map((t) => (
                          <button key={t} onClick={() => { setPrayerTopic(t); }} className="px-3 py-1.5 rounded-full bg-white border border-border text-xs hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {prayerTopic && prayerTopic !== 'open' && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Tema: <span className="text-[#C9A84C] font-medium">{prayerTopic}</span></p>
                      <button onClick={generatePrayer} disabled={generatingPrayer} className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                        {generatingPrayer ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : 'Gerar oração'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setStep(3)} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3 - Encerramento */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-display font-bold mb-1">Como você está se sentindo?</h2>
              <p className="text-sm text-muted-foreground mb-6">Selecione o humor que melhor descreve este momento.</p>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {moodOptions.map((m) => (
                  <button key={m} onClick={() => setMood(m)} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${mood === m ? 'bg-[#C9A84C]/15 text-[#C9A84C] ring-1 ring-[#C9A84C]/30' : 'bg-white text-foreground hover:bg-[#C9A84C]/5'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={completeMoment} disabled={saving || !mood} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Concluir'}
              </button>
            </div>
          )}

          {/* Step 4 - Conclusão */}
          {step === 4 && (
            <div className="text-center pt-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full gold-gradient flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </div>
              </motion.div>
              <h2 className="text-xl font-display font-bold mb-2">Seu momento foi concluído. ❤️</h2>
              <p className="text-sm text-muted-foreground mb-4">Você reservou alguns minutos do seu dia para sua fé.</p>
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 rounded-full px-5 py-2 mb-8">
                <span className="text-xl">🔥</span>
                <span className="text-lg font-bold text-[#C9A84C]">{streak}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <button onClick={() => router.push('/home')} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm">
                Voltar ao início
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
