'use client';

import { MobileContainer } from './mobile-container';
import { BottomNav } from './bottom-nav';

export function AppShellMobile({ children }: { children: React.ReactNode }) {
  return (
    <MobileContainer>
      <div className="pb-20">
        {children}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
