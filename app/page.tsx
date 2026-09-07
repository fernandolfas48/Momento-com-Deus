'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sun, Heart, BookOpen, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { MobileContainer } from '@/components/mobile-container';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.onboardingCompleted) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [status, session, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sun className="w-8 h-8 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  const benefits = [
    { icon: Clock, title: 'Apenas 5 minutos', desc: 'Um momento breve, mas poderoso para começar ou encerrar seu dia.' },
    { icon: BookOpen, title: 'Palavra & Reflexão', desc: 'Passagens bíblicas cuidadosamente selecionadas com reflexões diárias.' },
    { icon: Heart, title: 'Oração Guiada', desc: 'Orações personalizadas por inteligência artificial para seu momento.' },
  ];

  return (
    <MobileContainer className="warm-gradient">
      <div className="flex flex-col min-h-screen px-6 pt-12 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            Momento com Deus
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-10"
        >
          <h2 className="text-lg font-medium text-foreground leading-relaxed">
            Seu momento diário com Deus,{' '}
            <span className="text-[#C9A84C] font-semibold">mesmo quando você tem pouco tempo.</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Uma rotina espiritual simples de 5 a 10 minutos para fortalecer sua fé todos os dias.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="space-y-4 mb-10">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
              className="flex items-start gap-4 bg-white/70 rounded-xl p-4"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-auto space-y-3"
        >
          <Link href="/cadastro" className="block">
            <button className="w-full py-3.5 rounded-xl gold-gradient text-white font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Sparkles className="w-5 h-5" />
              Começar gratuitamente
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#C9A84C] font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
