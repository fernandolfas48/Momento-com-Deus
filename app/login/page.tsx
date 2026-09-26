'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen warm-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-[#C9A84C]/10 px-8 py-10 md:px-12 md:py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-1">Entre para continuar sua jornada</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:bg-white transition-colors"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-right">
            <Link href="/esqueci-senha" className="text-sm text-[#C9A84C] hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-gradient text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-[#C9A84C] font-medium hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
