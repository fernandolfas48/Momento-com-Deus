'use client';

import { useState, useEffect } from 'react';
import { Plus, Music, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const categoryList = ['Oração', 'Paz', 'Gratidão', 'Adoração', 'Começar o dia', 'Antes de dormir', 'Momentos difíceis'];

export default function AdminMusicas() {
  const [songs, setSongs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', category: 'Oração', coverUrl: '', audioUrl: '', durationSeconds: '', isFree: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = () => {
    fetch('/api/admin/songs')
      .then((r) => r.json())
      .then((d) => setSongs(d?.songs ?? []))
      .catch(() => {});
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error('Título obrigatório.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Música adicionada!');
      setShowForm(false);
      setForm({ title: '', artist: '', category: 'Oração', coverUrl: '', audioUrl: '', durationSeconds: '', isFree: true });
      loadSongs();
    } catch {
      toast.error('Erro ao adicionar.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (song: any) => {
    try {
      await fetch('/api/admin/songs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: song.id, isActive: !song.isActive }),
      });
      loadSongs();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display font-bold">Músicas</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-2 rounded-lg gold-gradient text-white text-xs font-medium flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 mb-4 space-y-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" className="w-full px-3 py-2 rounded-lg bg-muted/50 text-sm focus:outline-none" />
          <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Artista" className="w-full px-3 py-2 rounded-lg bg-muted/50 text-sm focus:outline-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted/50 text-sm">
            {categoryList.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={form.durationSeconds} onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })} placeholder="Duração (segundos)" type="number" className="w-full px-3 py-2 rounded-lg bg-muted/50 text-sm focus:outline-none" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="accent-[#C9A84C]" />
            Gratuita
          </label>
          <button onClick={handleSubmit} disabled={saving} className="w-full py-2 rounded-lg gold-gradient text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar música'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {(songs ?? []).map((song: any) => (
          <div key={song?.id} className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{song?.title}</h3>
              <p className="text-xs text-muted-foreground">{song?.category} · {song?.isFree ? 'Gratuita' : 'Premium'}</p>
            </div>
            <button onClick={() => toggleActive(song)} className="text-muted-foreground hover:text-foreground">
              {song?.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
