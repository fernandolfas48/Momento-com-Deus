'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Senha deve ter no mínimo 6 caracteres'); return; }
    if (password !== confirm) { toast.error('As senhas não coincidem'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? 'Erro ao redefinir senha'); return; }
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch { toast.error('Erro ao redefinir senha'); }
    finally { setLoading(false); }
  };

  if (!token) return (
    <div className="text-center">
      <p className="text-muted-foreground">Link inválido ou expirado.</p>
      <button onClick={() => router.push('/esqueci-senha')} className="mt-4 text-[#C9A84C] text-sm underline">Solicitar novo link</button>
    </div>
  );

  return done ? (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-xl font-display font-bold mb-2">Senha redefinida!</h1>
      <p className="text-muted-foreground text-sm">Redirecionando para o login...</p>
    </div>
  ) : (
    <>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-display font-bold mb-1">Nova senha</h1>
        <p className="text-muted-foreground text-sm">Escolha uma senha segura com no mínimo 6 caracteres.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha" className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar nova senha" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm disabled:opacity-70">
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </>
  );
}

export default function RedefinirSenha() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Suspense fallback={<div className="text-center text-muted-foreground">Carregando...</div>}>
          <RedefinirSenhaForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
