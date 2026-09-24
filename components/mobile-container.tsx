'use client';

export function MobileContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] md:flex md:items-start md:justify-center md:py-0">
      {/* Decorative background for desktop */}
      <div className="hidden md:block fixed inset-0 bg-gradient-to-br from-[#C9A84C]/5 via-transparent to-[#C9A84C]/3 pointer-events-none" />
      <div className={`relative mx-auto w-full max-w-[430px] min-h-screen bg-background md:shadow-2xl md:shadow-[#C9A84C]/10 ${className ?? ''}`}>
        {children}
      </div>
    </div>
  );
}
