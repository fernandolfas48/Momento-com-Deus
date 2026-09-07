'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Crown, Flame, LogOut, ChevronRight, Shield, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState<any>(null);
  const user = session?.user as any;

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then((d) => setProgress(d))
      .catch(() => {});
  }, []);

  const initials = (user?.name ?? '')
    .split(' ')
    .map((w: string) => w?.[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await signOut({ redirectTo: '/' });
  };

  const menuItems = [
    { icon: Flame, label: 'Minha jornada', href: '/jornada' },
    { icon: Crown, label: user?.plan === 'premium' ? 'Gerenciar assinatura' : 'Seja Premium', href: '/premium' },
    { icon: Bell, label: 'Notificações', action: () => toast('Notificações serão ativadas em breve.') },
    { icon: Shield, label: 'Termos de Uso', href: '/termos' },
    { icon: BookOpen, label: 'Política de Privacidade', href: '/privacidade' },
  ];

  return (
    <div className="px-5 pt-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-white text-xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-lg font-display font-bold">{user?.name}</h1>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>{user?.email}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${user?.plan === 'premium' ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-muted text-muted-foreground'}`}>
            {user?.plan === 'premium' ? 'Premium' : 'Gratuito'}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-lg font-bold text-[#C9A84C]">{progress?.streak ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-lg font-bold text-[#C9A84C]">{progress?.totalMoments ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Momentos</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-lg font-bold text-[#C9A84C]">{progress?.aiCredits ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Créditos IA</p>
        </div>
      </motion.div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => item.href ? router.push(item.href) : item.action?.()}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white text-left hover:bg-[#C9A84C]/5 transition-colors"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <item.icon className="w-5 h-5 text-[#C9A84C]" />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full mt-6 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium">Sair</span>
      </button>
    </div>
  );
}
