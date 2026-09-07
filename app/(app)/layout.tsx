'use client';

import { AuthGuard } from '@/components/auth-guard';
import { AppShellMobile } from '@/components/app-shell-mobile';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShellMobile>{children}</AppShellMobile>
    </AuthGuard>
  );
}
