'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MobileContainer } from '@/components/mobile-container';
import { Sun, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Preencha todos os campos.'); return; }
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        toast.error('Email ou senha inválidos.');
      } else {
        router.replace('/home');
      }
    } catch {
      toast.error('Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer className="warm-gradient">
      <div className="flex flex-col min-h-screen px-6 pt-16 pb-8">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl gold-gradient flex items-center justify-center">
            <Sun className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre para continuar sua jornada</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-[#C9A84C] font-medium hover:underline">Criar conta</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          <Link href="/esqueci-senha" className="text-[#C9A84C] hover:underline">Esqueci minha senha</Link>
        </p>
      </div>
    </MobileContainer>
  );
}
