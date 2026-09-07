'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Music, Settings, ArrowLeft, Loader2 } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { href: '/admin/musicas', icon: Music, label: 'Músicas' },
  { href: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.replace('/home');
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" /></div>;
  }
  if ((session?.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-border z-40 hidden md:block">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-sm text-[#C9A84C]">Admin</h2>
          <p className="text-xs text-muted-foreground">Momento com Deus</p>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-[#C9A84C]/10 text-[#C9A84C] font-medium' : 'text-foreground hover:bg-muted'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link href="/home" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3 h-3" /> Voltar ao app
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-border bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-display font-bold text-sm text-[#C9A84C]">Admin</h2>
          <Link href="/home" className="text-xs text-muted-foreground"><ArrowLeft className="w-4 h-4" /></Link>
        </div>
        <div className="flex gap-1 px-2 pb-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${isActive ? 'bg-[#C9A84C] text-white font-medium' : 'bg-muted text-foreground'}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="md:ml-56 p-4 md:p-8">{children}</main>
    </div>
  );
}
