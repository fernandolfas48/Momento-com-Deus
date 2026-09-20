'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const credits = searchParams.get('credits') ?? '0';

  useEffect(() => {
    const t = setTimeout(() => router.push('/perfil'), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="text-center max-w-sm">
      <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-display font-bold mb-2">{credits} créditos adicionados!</h1>
      <p className="text-muted-foreground mb-6">Seus créditos de IA já estão disponíveis na sua conta.</p>
      <button onClick={() => router.push('/meu-momento')} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm mb-3">
        Criar meu momento agora
      </button>
      <p className="text-xs text-muted-foreground">Redirecionando em 4 segundos...</p>
    </div>
  );
}

export default function CreditosSucesso() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Suspense fallback={<div />}>
          <SucessoContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
