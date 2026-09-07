'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, BookOpen, Brain, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  const cards = [
    { icon: Users, label: 'Total de usuários', value: data?.totalUsers ?? 0, color: 'text-blue-500' },
    { icon: Crown, label: 'Assinantes Premium', value: data?.premiumUsers ?? 0, color: 'text-[#C9A84C]' },
    { icon: BookOpen, label: 'Momentos hoje', value: data?.momentsToday ?? 0, color: 'text-green-500' },
    { icon: Brain, label: 'Créditos IA usados', value: data?.totalCreditsUsed ?? 0, color: 'text-purple-500' },
    { icon: Activity, label: 'Ativos hoje', value: data?.activeToday ?? 0, color: 'text-orange-500' },
    { icon: TrendingUp, label: 'Ativos 30d', value: data?.active30d ?? 0, color: 'text-teal-500' },
  ];

  return (
    <div>
      <h1 className="text-xl font-display font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-5"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <c.icon className={`w-6 h-6 mb-2 ${c.color}`} />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
