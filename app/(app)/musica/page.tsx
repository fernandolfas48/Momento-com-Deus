'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Play, Lock, Pause, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['Todas', 'Oração', 'Paz', 'Gratidão', 'Adoração', 'Começar o dia', 'Antes de dormir', 'Momentos difíceis'];

const categoryColors: Record<string, string> = {
  'Oração': 'from-[#C9A84C]/20 to-[#C9A84C]/5',
  'Paz': 'from-blue-100 to-blue-50',
  'Gratidão': 'from-green-100 to-green-50',
  'Adoração': 'from-purple-100 to-purple-50',
  'Começar o dia': 'from-orange-100 to-orange-50',
  'Antes de dormir': 'from-indigo-100 to-indigo-50',
  'Momentos difíceis': 'from-rose-100 to-rose-50',
};

export default function MusicaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [songs, setSongs] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState(searchParams?.get('category') ?? 'Todas');
  const [playing, setPlaying] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const [playlistLoading, setPlaylistLoading] = useState(true);
  const user = session?.user as any;

  useEffect(() => {
    fetch(`/api/songs?category=${encodeURIComponent(activeCategory)}`)
      .then((r) => r.json())
      .then((d) => setSongs(d?.songs ?? []))
      .catch(() => {});
  }, [activeCategory]);

  useEffect(() => {
    setPlaylistLoading(true);
    fetch('/api/ai/playlist')
      .then((r) => r.json())
      .then((d) => setPlaylist(d))
      .catch(() => {})
      .finally(() => setPlaylistLoading(false));
  }, []);

  const playSong = (song: any) => {
    if (!song?.isFree && user?.plan !== 'premium') {
      toast('Esta música é exclusiva Premium', { action: { label: 'Ver Premium', onClick: () => router.push('/premium') } });
      return;
    }
    setPlaying(playing === song?.id ? null : song?.id);
  };

  const formatDuration = (s: number | null) => {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-[#C9A84C]" /> Música
      </h1>

      {/* Playlist personalizada semanal (curadoria com IA sobre a biblioteca existente) */}
      {!playlistLoading && (
        <div className="mb-5">
          {playlist?.locked ? (
            <button
              onClick={() => router.push('/premium')}
              className="w-full text-left bg-gradient-to-br from-[#C9A84C]/15 to-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 flex items-center gap-3 hover:opacity-90"
            >
              <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">Sua playlist da semana</h3>
                <p className="text-xs text-muted-foreground">Selecionada por IA com base nos seus objetivos. Exclusivo Premium.</p>
              </div>
              <Crown className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
            </button>
          ) : playlist?.songs?.length ? (
            <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="text-sm font-semibold">Sua playlist da semana</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {playlist.songs.map((song: any) => (
                  <button
                    key={song.id}
                    onClick={() => playSong(song)}
                    className="flex-shrink-0 w-28 text-left"
                  >
                    <div className={`w-28 h-20 rounded-lg bg-gradient-to-br ${categoryColors[song?.category] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center mb-1.5`}>
                      {playing === song?.id ? <Pause className="w-5 h-5 text-[#C9A84C]" /> : <Play className="w-5 h-5 text-[#C9A84C]" />}
                    </div>
                    <p className="text-xs font-medium truncate">{song.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{song.category}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === c
                ? 'bg-[#C9A84C] text-white'
                : 'bg-white text-foreground border border-border hover:border-[#C9A84C]/30'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Songs list */}
      <div className="space-y-3">
        {(songs ?? []).map((song: any, i: number) => (
          <motion.div
            key={song?.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => playSong(song)}
            className="bg-white rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#C9A84C]/5 transition-colors"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${categoryColors[song?.category] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center flex-shrink-0`}>
              {playing === song?.id ? (
                <Pause className="w-5 h-5 text-[#C9A84C]" />
              ) : (
                <Play className="w-5 h-5 text-[#C9A84C]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{song?.title}</h3>
              <p className="text-xs text-muted-foreground">{song?.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatDuration(song?.durationSeconds)}</span>
              {!song?.isFree && <Lock className="w-3.5 h-3.5 text-[#C9A84C]" />}
            </div>
          </motion.div>
        ))}
      </div>

      {(songs ?? []).length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-8">Nenhuma música encontrada nesta categoria.</p>
      )}

      <p className="text-xs text-muted-foreground text-center mt-6 mb-4">
        Músicas de demonstração. Conteúdo musical será adicionado em breve.
      </p>
    </div>
  );
}
