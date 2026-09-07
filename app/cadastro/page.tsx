'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MobileContainer } from '@/components/mobile-container';
import { Sun, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function CadastroPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Preencha todos os campos.'); return; }
    if (password.length < 6) { toast.error('A senha deve ter no mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Erro ao criar conta.');
        return;
      }
      // Auto login
      const loginRes = await signIn('credentials', { email, password, redirect: false });
      if (loginRes?.error) {
        toast.error('Conta criada, mas houve erro no login. Tente entrar manualmente.');
        router.push('/login');
      } else {
        router.replace('/onboarding');
      }
    } catch {
      toast.error('Erro ao criar conta.');
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
          <h1 className="text-xl font-display font-bold">Criar sua conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Começe sua jornada espiritual</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>
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
              placeholder="Crie uma senha (mín. 6 caracteres)"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#C9A84C] font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </MobileContainer>
  );
}
