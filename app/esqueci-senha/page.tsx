'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EsqueciSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Informe seu email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else toast.error('Erro ao enviar email. Tente novamente.');
    } catch { toast.error('Erro ao enviar email. Tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </button>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-display font-bold mb-2">Email enviado!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Se este email estiver cadastrado, você receberá um link para redefinir sua senha em alguns minutos.
            </p>
            <button onClick={() => router.push('/login')} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm">
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold mb-1">Esqueceu a senha?</h1>
              <p className="text-muted-foreground text-sm">Informe seu email e enviaremos um link para redefinir sua senha.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gold-gradient text-white font-semibold text-sm disabled:opacity-70">
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
