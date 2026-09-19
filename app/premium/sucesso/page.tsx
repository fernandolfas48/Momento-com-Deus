'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

export default function PremiumSucesso() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push('/home'), 5000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Bem-vindo ao Premium!</h1>
        <p className="text-muted-foreground mb-6">
          Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos ilimitados.
        </p>
        <div className="bg-[#C9A84C]/10 rounded-2xl p-4 mb-6 text-left space-y-2">
          {['50 créditos de IA por mês', 'Momentos ilimitados com IA', 'Acesso a todas as músicas', 'Orações e reflexões personalizadas'].map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Redirecionando em 5 segundos...</p>
        <button onClick={() => router.push('/home')} className="mt-4 w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm">
          Começar agora
        </button>
      </motion.div>
    </div>
  );
}
