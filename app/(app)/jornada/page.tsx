'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, BookOpen, Heart, HandHeart, Calendar } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';

export default function JornadaPage() {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then((d) => setProgress(d))
      .catch(() => {});
  }, []);

  const stats = [
    { icon: Flame, label: 'Streak atual', value: progress?.streak ?? 0, color: 'text-orange-500' },
    { icon: BookOpen, label: 'Momentos', value: progress?.totalMoments ?? 0, color: 'text-[#C9A84C]' },
    { icon: Heart, label: 'Reflexões', value: progress?.totalReflections ?? 0, color: 'text-pink-500' },
    { icon: HandHeart, label: 'Orações', value: progress?.totalPrayers ?? 0, color: 'text-blue-500' },
  ];

  // Generate calendar days for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const completedSet = new Set(progress?.completedDates ?? []);

  const monthName = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-display font-bold mb-5 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#C9A84C]" /> Minha jornada
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 text-center"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <s.icon className={`w-6 h-6 mx-auto mb-1 ${s.color}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <ClientOnly fallback={<div className="h-40" />}>
          <h3 className="text-sm font-semibold text-center mb-4 capitalize">{monthName}</h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (<div key={`e-${i}`} />))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isCompleted = completedSet.has(dateStr);
              const isToday = day === now.getDate();
              return (
                <div key={day} className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs ${
                  isCompleted ? 'bg-[#C9A84C] text-white font-semibold' : isToday ? 'ring-1 ring-[#C9A84C] text-[#C9A84C] font-medium' : 'text-foreground'
                }`}>
                  {day}
                </div>
              );
            })}
          </div>
        </ClientOnly>
      </motion.div>
    </div>
  );
}
