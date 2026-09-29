'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Lock, Pause, Sparkles, Crown, Volume2, X, SkipBack, SkipForward } from 'lucide-react';
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
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<any>(null);
  const [playlistLoading, setPlaylistLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Converte URL do Google Drive para URL do proxy interno
  const getProxyUrl = (audioUrl: string) => {
    if (!audioUrl) return '';
    // Extrai o file ID da URL do Google Drive
    const match = audioUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return `/api/audio?id=${match[1]}`;
    return audioUrl; // fallback para URL original se não for Drive
  };

  // Audio player logic
  useEffect(() => {
    if (!currentSong?.audioUrl) return;

    let cancelled = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const proxyUrl = getProxyUrl(currentSong.audioUrl);
    const audio = new Audio(proxyUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => { if (!cancelled) setDuration(audio.duration); });
    audio.addEventListener('timeupdate', () => { if (!cancelled) setProgress(audio.currentTime); });
    audio.addEventListener('ended', () => {
      if (cancelled) return;
      setIsPlaying(false);
      setProgress(0);
      const idx = songs.findIndex((s) => s.id === currentSong.id);
      if (idx < songs.length - 1) playSong(songs[idx + 1]);
    });
    audio.addEventListener('error', () => {
      if (cancelled) return;
      if (audio.readyState === 0) {
        toast.error('Não foi possível carregar esta música. Tente novamente.');
      }
    });

    audio.play().then(() => { if (!cancelled) setIsPlaying(true); }).catch(() => { if (!cancelled) setIsPlaying(false); });

    return () => {
      cancelled = true;
      audio.pause();
      audio.src = '';
    };
  }, [currentSong]);

  const playSong = (song: any) => {
    if (!song?.isFree && user?.plan !== 'premium') {
      toast('Esta música é exclusiva Premium', { action: { label: 'Ver Premium', onClick: () => router.push('/premium') } });
      return;
    }
    if (!song?.audioUrl) {
      toast.error('Áudio ainda não disponível para esta música.');
      return;
    }
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().then(() => setIsPlaying(true));
      }
      return;
    }
    setCurrentSong(song);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setProgress(val);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    const idx = songs.findIndex((s) => s.id === currentSong?.id);
    if (idx < songs.length - 1) playSong(songs[idx + 1]);
  };

  const playPrev = () => {
    const idx = songs.findIndex((s) => s.id === currentSong?.id);
    if (idx > 0) playSong(songs[idx - 1]);
  };

  return (
    <div className="px-5 pt-6 pb-40">
      <h1 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-[#C9A84C]" /> Música
      </h1>

      {/* Playlist personalizada semanal */}
      {!playlistLoading && (
        <div className="mb-5">
          {playlist?.locked ? (
            <button onClick={() => router.push('/premium')} className="w-full text-left bg-gradient-to-br from-[#C9A84C]/15 to-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 flex items-center gap-3 hover:opacity-90">
              <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">Sua playlist da semana</h3>
                <p className="text-xs text-muted-foreground">Selecionada com base nos seus objetivos. Exclusivo Premium.</p>
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
                  <button key={song.id} onClick={() => playSong(song)} className="flex-shrink-0 w-28 text-left">
                    <div className={`w-28 h-20 rounded-lg bg-gradient-to-br ${categoryColors[song?.category] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center mb-1.5`}>
                      {currentSong?.id === song?.id && isPlaying ? <Pause className="w-5 h-5 text-[#C9A84C]" /> : <Play className="w-5 h-5 text-[#C9A84C]" />}
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
          <button key={c} onClick={() => setActiveCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === c ? 'bg-[#C9A84C] text-white' : 'bg-white text-foreground border border-border hover:border-[#C9A84C]/30'}`}>
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
            className={`bg-white rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${currentSong?.id === song?.id ? 'ring-2 ring-[#C9A84C]/40 bg-[#C9A84C]/5' : 'hover:bg-[#C9A84C]/5'}`}
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${categoryColors[song?.category] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center flex-shrink-0`}>
              {currentSong?.id === song?.id && isPlaying ? <Pause className="w-5 h-5 text-[#C9A84C]" /> : <Play className="w-5 h-5 text-[#C9A84C]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{song?.title}</h3>
              <p className="text-xs text-muted-foreground">{song?.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatTime(song?.durationSeconds)}</span>
              {!song?.isFree && <Lock className="w-3.5 h-3.5 text-[#C9A84C]" />}
            </div>
          </motion.div>
        ))}
      </div>

      {(songs ?? []).length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-8">Nenhuma música encontrada nesta categoria.</p>
      )}

      {/* Mini Player fixo no rodapé */}
      <AnimatePresence>
        {currentSong && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 mx-auto max-w-[430px] md:max-w-[520px] px-3 z-50"
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-black/10 border border-border p-4">
              {/* Song info + controls */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[currentSong?.category] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center flex-shrink-0`}>
                  <Volume2 className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{currentSong?.title}</p>
                  <p className="text-xs text-muted-foreground">{currentSong?.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={playPrev} className="p-1.5 rounded-full hover:bg-muted">
                    <SkipBack className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                      else { audioRef.current?.play().then(() => setIsPlaying(true)); }
                    }}
                    className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </button>
                  <button onClick={playNext} className="p-1.5 rounded-full hover:bg-muted">
                    <SkipForward className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { audioRef.current?.pause(); setCurrentSong(null); setIsPlaying(false); }} className="p-1.5 rounded-full hover:bg-muted ml-1">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8 text-right">{formatTime(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={seek}
                  className="flex-1 h-1 accent-[#C9A84C] cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground w-8">{formatTime(duration)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
