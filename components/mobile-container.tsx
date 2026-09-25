'use client';

export function MobileContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full min-h-screen bg-background ${className ?? ''}`}>
      {children}
    </div>
  );
}
