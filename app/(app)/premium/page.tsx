'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Infinity, Music, Brain, Heart, Star, Check } from 'lucide-react';
import { toast } from 'sonner';

const benefits = [
  { icon: Sparkles, text: '50 créditos de IA por mês' },
  { icon: Brain, text: 'Orações e reflexões personalizadas' },
  { icon: Music, text: 'Acesso a todas as músicas' },
  { icon: Heart, text: 'Momentos ilimitados com IA' },
  { icon: Star, text: 'Temas exclusivos' },
];

export default function PremiumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prices, setPrices] = useState({ monthly: '19,90', yearly: '149,90' });
  const [selected, setSelected] = useState('yearly');
  const user = session?.user as any;

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        const s = d?.settings ?? {};
        if (s.price_monthly_brl) setPrices((p) => ({ ...p, monthly: s.price_monthly_brl.replace('.', ',') }));
        if (s.price_yearly_brl) setPrices((p) => ({ ...p, yearly: s.price_yearly_brl.replace('.', ',') }));
      })
      .catch(() => {});
  }, []);

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data?.error ?? 'Erro ao iniciar pagamento');
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Erro ao conectar com o sistema de pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (user?.plan === 'premium') {
    return (
      <div className="px-5 pt-12 text-center">
        <Crown className="w-12 h-12 text-[#C9A84C] mx-auto mb-4" />
        <h1 className="text-xl font-display font-bold mb-2">Você já é Premium!</h1>
        <p className="text-sm text-muted-foreground">Aproveite todos os benefícios da sua assinatura.</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6">
      <div className="text-center mb-6">
        <Crown className="w-10 h-10 text-[#C9A84C] mx-auto mb-3" />
        <h1 className="text-xl font-display font-bold">Fortaleça sua rotina espiritual</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tenha uma experiência mais personalizada para manter seu momento diário.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="space-y-3">
          {benefits.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-4 h-4 text-[#C9A84C]" />
              </div>
              <span className="text-sm text-foreground">{b.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => setSelected('yearly')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${selected === 'yearly' ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-border bg-white'}`}
        >
          {selected === 'yearly' && (
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#C9A84C] text-white text-[10px] font-semibold">Mais popular</span>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Anual</p>
              <p className="text-xs text-muted-foreground">Economize 40%</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">R$ {prices.yearly}</p>
              <p className="text-xs text-muted-foreground">/ano</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelected('monthly')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selected === 'monthly' ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-border bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Mensal</p>
              <p className="text-xs text-muted-foreground">Flexibilidade</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">R$ {prices.monthly}</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={handleSubscribe} disabled={loading} className="w-full py-3.5 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70">
        <Crown className="w-4 h-4" /> {loading ? 'Aguarde...' : 'Experimentar 7 dias grátis'}
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">
        7 dias grátis, depois R$ {selected === 'yearly' ? `${prices.yearly}/ano` : `${prices.monthly}/mês`}. Cancele quando quiser.
      </p>
      <button onClick={() => router.push('/home')} className="w-full mt-2 py-2.5 text-sm text-muted-foreground hover:text-foreground text-center">
        Continuar com versão gratuita
      </button>
    </div>
  );
}
