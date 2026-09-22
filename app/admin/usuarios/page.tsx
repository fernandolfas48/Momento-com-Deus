'use client';

import { useState, useEffect } from 'react';
import { Search, Crown, Sparkles, Plus, Minus, Check } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';
import { toast } from 'sonner';

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [creditValue, setCreditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d?.users ?? []); setTotalPages(d?.totalPages ?? 1); })
      .catch(() => {});
  };

  useEffect(() => { loadUsers(); }, [search, page]);

  const handleCredits = async (email: string, operation: 'add' | 'subtract' | 'set') => {
    const credits = parseInt(creditValue);
    if (isNaN(credits) || credits < 0) { toast.error('Valor inválido'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credits, operation }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? 'Erro ao atualizar créditos'); return; }
      toast.success(`Créditos atualizados: ${data.user.aiCredits} créditos`);
      setEditingCredits(null);
      setCreditValue('');
      loadUsers();
    } catch { toast.error('Erro ao atualizar créditos'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-xl font-display font-bold mb-4">Usuários</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
        />
      </div>
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Plano</th>
                <th className="text-left px-4 py-3 font-medium">Créditos</th>
                <th className="text-left px-4 py-3 font-medium">Streak</th>
                <th className="text-left px-4 py-3 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: any) => (
                <tr key={u?.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{u?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u?.email}</td>
                  <td className="px-4 py-3">
                    {u?.plan === 'premium' ? (
                      <span className="inline-flex items-center gap-1 text-[#C9A84C] text-xs font-medium">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCredits === u?.email ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={creditValue}
                          onChange={(e) => setCreditValue(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-border rounded focus:outline-none"
                          placeholder="qtd"
                          autoFocus
                        />
                        <button onClick={() => handleCredits(u.email, 'add')} disabled={saving} title="Adicionar" className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleCredits(u.email, 'subtract')} disabled={saving} title="Remover" className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
                          <Minus className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleCredits(u.email, 'set')} disabled={saving} title="Definir valor exato" className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => { setEditingCredits(null); setCreditValue(''); }} className="text-xs text-muted-foreground hover:text-foreground px-1">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingCredits(u?.email); setCreditValue(''); }}
                        className="inline-flex items-center gap-1 text-xs text-[#C9A84C] hover:underline"
                      >
                        <Sparkles className="w-3 h-3" /> {u?.aiCredits ?? 0}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">{u?.currentStreak ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    <ClientOnly fallback="--">
                      {new Date(u?.createdAt).toLocaleDateString('pt-BR')}
                    </ClientOnly>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs bg-white border border-border disabled:opacity-40">Anterior</button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-xs bg-white border border-border disabled:opacity-40">Próximo</button>
        </div>
      )}
    </div>
  );
}
