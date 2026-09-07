'use client';

import { useState, useEffect } from 'react';
import { Search, Crown } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d?.users ?? []); setTotalPages(d?.totalPages ?? 1); })
      .catch(() => {});
  }, [search, page]);

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
                <th className="text-left px-4 py-3 font-medium">Streak</th>
                <th className="text-left px-4 py-3 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: any) => (
                <tr key={u?.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">{u?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u?.email}</td>
                  <td className="px-4 py-3">
                    {u?.plan === 'premium' ? (
                      <span className="inline-flex items-center gap-1 text-[#C9A84C] text-xs font-medium">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{u?.currentStreak ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">
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
