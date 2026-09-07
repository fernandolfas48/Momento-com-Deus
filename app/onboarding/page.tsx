'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/mobile-container';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Clock, Target, CalendarDays, Sunrise, ChevronRight, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

const timeOptions = ['3 minutos', '5 minutos', '10 minutos', '15 minutos', '30 minutos'];
const goalOptions = [
  'Fortalecer minha fé', 'Ter mais paz', 'Desenvolver gratidão', 'Superar ansiedade',
  'Orar mais', 'Conhecer a Bíblia', 'Cuidar da saúde emocional', 'Criar uma rotina espiritual',
];
const freqOptions = ['Todos os dias', 'Dias de semana', '3 vezes por semana'];
const timeOfDayOptions = [
  { label: 'Manhã', icon: Sunrise, desc: 'Começar o dia com Deus' },
  { label: 'Tarde', icon: Sun, desc: 'Uma pausa para refletir' },
  { label: 'Noite', icon: Clock, desc: 'Encerrar o dia em paz' },
];

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dailyTime, setDailyTime] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [saving, setSaving] = useState(false);

  const totalSteps = 5; // 4 questions + completion

  const toggleGoal = (g: string) => {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  const canNext = () => {
    if (step === 0) return !!dailyTime;
    if (step === 1) return goals.length > 0;
    if (step === 2) return !!frequency;
    if (step === 3) return !!preferredTime;
    return true;
  };

  const handleNext = () => {
    if (!canNext()) return;
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      savePreferences();
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyTime, goals, frequency, preferredTime, onboardingCompleted: true }),
      });
      if (!res.ok) throw new Error();
      await update({ onboardingCompleted: true });
      setStep(4);
    } catch {
      toast.error('Erro ao salvar preferências.');
    } finally {
      setSaving(false);
    }
  };

  const stepIcons = [Clock, Target, CalendarDays, Sunrise];

  return (
    <MobileContainer className="warm-gradient">
      <div className="flex flex-col min-h-screen px-6 pt-8 pb-8">
        {/* Progress bar */}
        {step < 4 && (
          <div className="flex gap-1.5 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#C9A84C]' : 'bg-border'}`} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && (
              <>
                <h2 className="text-lg font-display font-bold mb-2">Quanto tempo por dia?</h2>
                <p className="text-sm text-muted-foreground mb-6">Escolha o tempo ideal para seu momento diário.</p>
                <div className="space-y-2.5">
                  {timeOptions.map((t) => (
                    <button key={t} onClick={() => setDailyTime(t)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${dailyTime === t ? 'bg-[#C9A84C]/15 text-[#C9A84C] ring-1 ring-[#C9A84C]/30' : 'bg-white/70 text-foreground hover:bg-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-lg font-display font-bold mb-2">O que deseja fortalecer?</h2>
                <p className="text-sm text-muted-foreground mb-6">Selecione um ou mais objetivos.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {goalOptions.map((g) => (
                    <button key={g} onClick={() => toggleGoal(g)} className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${goals.includes(g) ? 'bg-[#C9A84C]/15 text-[#C9A84C] ring-1 ring-[#C9A84C]/30' : 'bg-white/70 text-foreground hover:bg-white'}`}>
                      {goals.includes(g) && <Check className="inline w-3 h-3 mr-1" />}
                      {g}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-display font-bold mb-2">Com que frequência?</h2>
                <p className="text-sm text-muted-foreground mb-6">Defina a frequência da sua rotina.</p>
                <div className="space-y-2.5">
                  {freqOptions.map((f) => (
                    <button key={f} onClick={() => setFrequency(f)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${frequency === f ? 'bg-[#C9A84C]/15 text-[#C9A84C] ring-1 ring-[#C9A84C]/30' : 'bg-white/70 text-foreground hover:bg-white'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-lg font-display font-bold mb-2">Horário preferido</h2>
                <p className="text-sm text-muted-foreground mb-6">Quando é melhor para você?</p>
                <div className="space-y-3">
                  {timeOfDayOptions.map((t) => (
                    <button key={t.label} onClick={() => setPreferredTime(t.label)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all ${preferredTime === t.label ? 'bg-[#C9A84C]/15 ring-1 ring-[#C9A84C]/30' : 'bg-white/70 hover:bg-white'}`}>
                      <t.icon className={`w-5 h-5 ${preferredTime === t.label ? 'text-[#C9A84C]' : 'text-muted-foreground'}`} />
                      <div className="text-left">
                        <div className={`font-medium ${preferredTime === t.label ? 'text-[#C9A84C]' : 'text-foreground'}`}>{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full gold-gradient flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-xl font-display font-bold mb-2">Tudo pronto!</h2>
                <p className="text-sm text-muted-foreground mb-8">Seu primeiro momento está esperando por você.</p>
                <button
                  onClick={() => router.push('/home')}
                  className="w-full py-3.5 rounded-xl gold-gradient text-white font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90"
                >
                  Começar meu momento
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <button
            onClick={handleNext}
            disabled={!canNext() || saving}
            className="mt-auto w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Continuar'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </MobileContainer>
  );
}
