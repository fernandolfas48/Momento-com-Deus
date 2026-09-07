'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Sun, Music, BookOpen, User } from 'lucide-react';

const navItems = [
  { href: '/home', icon: Home, label: 'Início' },
  { href: '/meu-momento', icon: Sun, label: 'Momento' },
  { href: '/musica', icon: Music, label: 'Música' },
  { href: '/diario', icon: BookOpen, label: 'Diário' },
  { href: '/perfil', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#C9A84C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
