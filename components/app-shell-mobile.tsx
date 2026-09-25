'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Sun, Music, BookOpen, User, Crown } from 'lucide-react';
import { MobileContainer } from './mobile-container';
import { BottomNav } from './bottom-nav';

const navItems = [
  { href: '/home', icon: Home, label: 'Início' },
  { href: '/meu-momento', icon: Sun, label: 'Momento' },
  { href: '/musica', icon: Music, label: 'Música' },
  { href: '/diario', icon: BookOpen, label: 'Diário' },
  { href: '/perfil', icon: User, label: 'Perfil' },
];

function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-border fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-white text-lg">☀️</div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">Momento</p>
            <p className="font-display font-bold text-sm leading-tight text-[#C9A84C]">com Deus</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Premium CTA */}
      <div className="px-3 pb-6">
        <Link
          href="/premium"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C]/10 to-[#C9A84C]/5 text-[#C9A84C] text-sm font-medium hover:from-[#C9A84C]/20 hover:to-[#C9A84C]/10 transition-all"
        >
          <Crown size={18} />
          Seja Premium
        </Link>
      </div>
    </aside>
  );
}

export function AppShellMobile({ children }: { children: React.ReactNode }) {
  return (
    <MobileContainer>
      {/* Desktop layout */}
      <div className="hidden md:block">
        <DesktopSidebar />
        <main className="ml-64 min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="pb-20">
          {children}
        </div>
        <BottomNav />
      </div>
    </MobileContainer>
  );
}
