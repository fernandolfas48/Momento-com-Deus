'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Flame, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dailyData, setDailyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      router.replace('/onboarding');
      return;
    }
    fetch('/api/daily-moment')
      .then((r) => r.json())
      .then((d) => setDailyData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.name?.split(' ')?.[0] ?? '';

  return (
    <div className="px-5 pt-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-muted-foreground text-sm">{getGreeting()},</p>
        <h1 className="text-2xl font-display font-bold tracking-tight">{firstName}</h1>
      </motion.div>

      {/* Streak card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#C9A84C]/10 to-[#C9A84C]/5 rounded-2xl p-4 mb-5 flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-[#C9A84C]/15 flex items-center justify-center">
          <Flame className="w-6 h-6 text-[#C9A84C]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#C9A84C]">{dailyData?.streak ?? 0}</p>
          <p className="text-xs text-muted-foreground">
            {(dailyData?.streak ?? 0) > 0 ? 'dias consecutivos' : 'Comece hoje sua jornada'}
          </p>
        </div>
      </motion.div>

      {/* Daily moment card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 mb-5"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Momento do dia</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dailyData?.theme?.theme ?? 'Carregando...'}
            </p>
          </div>
        </div>
        {dailyData?.theme?.bibleReference && (
          <p className="text-xs text-muted-foreground mb-4 italic">
            {dailyData.theme.bibleReference}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {dailyData?.dailyTime ?? '5 minutos'}
          </span>
          {dailyData?.completedToday ? (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="text-base">✓</span> Concluído hoje
            </span>
          ) : (
            <button
              onClick={() => router.push('/momento')}
              className="px-4 py-2 rounded-lg gold-gradient text-white text-xs font-semibold flex items-center gap-1 hover:opacity-90"
            >
              Começar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={() => router.push('/meu-momento')}
          className="bg-white rounded-2xl p-4 text-left hover:bg-[#C9A84C]/5 transition-colors"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <Sparkles className="w-5 h-5 text-[#C9A84C] mb-2" />
          <h4 className="text-sm font-semibold">Meu Momento</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Personalizado para você</p>
        </button>
        <button
          onClick={() => router.push('/musica')}
          className="bg-white rounded-2xl p-4 text-left hover:bg-[#C9A84C]/5 transition-colors"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <Sun className="w-5 h-5 text-[#C9A84C] mb-2" />
          <h4 className="text-sm font-semibold">Música</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Ouça e relaxe</p>
        </button>
      </motion.div>
    </div>
  );
}
