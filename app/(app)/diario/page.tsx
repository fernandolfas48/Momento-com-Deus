'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, HandHeart, Sun, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ClientOnly } from '@/components/client-only';

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'reflection', label: 'Reflexões' },
  { key: 'prayer_request', label: 'Orações' },
  { key: 'moment', label: 'Momentos' },
  { key: 'gratitude', label: 'Gratidão' },
];

const typeIcons: Record<string, any> = {
  reflection: Heart,
  prayer_request: HandHeart,
  moment: Sun,
  gratitude: BookOpen,
};

// Prompts guiados por tipo, para reduzir a fricção de escrever do zero.
const guidedPrompts: Record<string, string[]> = {
  reflection: [
    'O que Deus colocou no meu coração hoje?',
    'Que situação de hoje eu gostaria de entender melhor?',
    'O que aprendi sobre mim mesmo hoje?',
  ],
  prayer_request: [
    'Por quem eu gostaria de orar hoje?',
    'Que dificuldade eu quero entregar a Deus agora?',
    'O que eu preciso pedir com fé hoje?',
  ],
  moment: [
    'Como foi meu momento com Deus hoje?',
    'Que passagem ou oração tocou meu coração?',
    'O que eu quero lembrar desse momento?',
  ],
  gratitude: [
    'Pelo que sou grato hoje?',
    'Quem fez diferença na minha vida essa semana?',
    'Que bênção recebi que eu não esperava?',
  ],
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('reflection');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/diary?filter=${filter}`)
      .then((r) => r.json())
      .then((d) => setEntries(d?.entries ?? []))
      .catch(() => {});
  }, [filter]);

  const saveEntry = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, entryType: newType }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntries([data.entry, ...entries]);
      setNewContent('');
      setShowNew(false);
      toast.success('Registro salvo!');
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-display font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C9A84C]" /> Meu diário
        </h1>
        <button onClick={() => setShowNew(!showNew)} className="w-8 h-8 rounded-full bg-[#C9A84C] text-white flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New entry */}
      {showNew && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex gap-2 mb-3">
            {filters.filter((f) => f.key !== 'all').map((f) => (
              <button key={f.key} onClick={() => setNewType(f.key)} className={`px-2.5 py-1 rounded-full text-xs ${newType === f.key ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-medium' : 'bg-muted text-muted-foreground'}`}>
                {f.label}
              </button>
            ))}
          </div>
          {/* Prompts guiados: ajudam a começar a escrever */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(guidedPrompts[newType] ?? []).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setNewContent((prev) => (prev ? prev : p + ' '))}
                className="px-2.5 py-1 rounded-full text-[11px] bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Escreva aqui..." className="w-full h-24 p-3 rounded-lg bg-muted/50 text-sm resize-none focus:outline-none" />
          <button onClick={saveEntry} disabled={saving} className="w-full mt-2 py-2 rounded-lg gold-gradient text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 mb-4">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.key ? 'bg-[#C9A84C] text-white' : 'bg-white text-foreground border border-border'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {(entries ?? []).map((entry: any, i: number) => {
          const Icon = typeIcons[entry?.entryType] ?? BookOpen;
          const isExpanded = expanded === entry?.id;
          return (
            <motion.div
              key={entry?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setExpanded(isExpanded ? null : entry?.id)}
              className="bg-white rounded-xl p-4 cursor-pointer hover:bg-[#C9A84C]/5 transition-colors"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <ClientOnly fallback={<span className="text-xs text-muted-foreground">--</span>}>
                      <span className="text-xs text-muted-foreground">{formatDate(entry?.createdAt)}</span>
                    </ClientOnly>
                    {entry?.mood && <span className="text-xs text-[#C9A84C]">{entry.mood}</span>}
                  </div>
                  <p className={`text-sm text-foreground mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>{entry?.content}</p>
                  {!isExpanded && (entry?.content?.length ?? 0) > 100 && (
                    <ChevronDown className="w-4 h-4 text-muted-foreground mt-1" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {(entries ?? []).length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-8">Nenhum registro encontrado. Comece escrevendo algo!</p>
      )}
    </div>
  );
}
