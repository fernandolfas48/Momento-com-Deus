'use client';

export function MobileContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[430px] min-h-screen bg-background relative ${className ?? ''}`}>
      {children}
    </div>
  );
}
