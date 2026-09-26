'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        toast.error(data?.debug ?? data?.error ?? 'Erro ao criar conta.');
        return;
      }
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
    <div className="min-h-screen warm-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-[#C9A84C]/10 px-8 py-10 md:px-12 md:py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">Criar sua conta</h1>
          <p className="text-muted-foreground mt-1">Comece sua jornada espiritual</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:bg-white transition-colors"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:bg-white transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Crie uma senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:bg-white transition-colors"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-gradient text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#C9A84C] font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
