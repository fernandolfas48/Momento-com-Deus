'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';

const PACKAGES = [
  { id: 'credits_10', credits: 10, price: 'R$ 4,90', description: 'Ideal para experimentar', highlight: false },
  { id: 'credits_30', credits: 30, price: 'R$ 9,90', description: 'Mais popular', highlight: true },
  { id: 'credits_40', credits: 40, price: 'R$ 24,90', description: 'Melhor custo-benefício', highlight: false },
];

export default function ComprarCreditos() {
  const router = useRouter();
  const [selected, setSelected] = useState('credits_30');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selected }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? 'Erro ao processar compra'); return; }
      window.location.href = data.url;
    } catch { toast.error('Erro ao conectar com o sistema de pagamento'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-sm mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold mb-1">Comprar créditos</h1>
          <p className="text-muted-foreground text-sm">Cada crédito permite criar um momento personalizado para você.</p>
        </div>

        <div className="space-y-3 mb-6">
          {PACKAGES.map((pkg) => (
            <motion.button
              key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left rounded-2xl p-4 border-2 transition-all relative ${
                selected === pkg.id
                  ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                  : 'border-border bg-white'
              }`}
            >
              {pkg.highlight && (
                <span className="absolute -top-2.5 left-4 bg-[#C9A84C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  MAIS POPULAR
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === pkg.id ? 'bg-[#C9A84C]/15' : 'bg-muted'}`}>
                    <Zap className={`w-5 h-5 ${selected === pkg.id ? 'text-[#C9A84C]' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{pkg.credits} créditos</p>
                    <p className="text-xs text-muted-foreground">{pkg.description}</p>
                  </div>
                </div>
                <p className="font-bold text-sm text-[#C9A84C]">{pkg.price}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <button onClick={handleBuy} disabled={loading} className="w-full py-3.5 rounded-xl gold-gradient text-white font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          {loading ? 'Aguarde...' : 'Comprar agora'}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">Pagamento seguro via Stripe 🔒</p>
      </div>
    </div>
  );
}
