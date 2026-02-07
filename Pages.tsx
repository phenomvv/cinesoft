
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Loader2, Play, Film, Tv, Sparkles, Search, Compass, Laugh, CloudRain, Rocket, Gem, Ghost, Eye, Bookmark, UserCircle, Baby, Moon, Sun, Inbox, X,
  Zap, Heart, Palette, Grid
} from 'lucide-react';
import { MovieCard, SkeletonCard } from './SharedUI';
import * as GeminiAPI from './geminiService';
import * as TmdbAPI from './tmdbService';

const API = TmdbAPI.hasApiKey() ? TmdbAPI : GeminiAPI;

const SEMANTIC_PROMPTS = [
  { label: 'Feel-Good', icon: Laugh, query: 'Movies that feel like a warm hug' },
  { label: 'Rainy Day', icon: CloudRain, query: 'Atmospheric mystery movies for a rainy night' },
  { label: 'Space', icon: Rocket, query: 'Hard sci-fi movies set in deep space' },
  { label: 'Hidden Gems', icon: Gem, query: 'Highly rated indie movies from the last 5 years' },
  { label: 'Thrilling', icon: Ghost, query: 'Psychological thrillers with huge plot twists' }
];

const GENRES = [
  { id: 'Action', label: 'Action', icon: Zap, color: '#FC8181' },
  { id: 'Comedy', label: 'Comedy', icon: Laugh, color: '#F6E05E' },
  { id: 'Horror', label: 'Horror', icon: Ghost, color: '#A0AEC0' },
  { id: 'Drama', label: 'Drama', icon: Film, color: '#63B3ED' },
  { id: 'Sci-Fi', label: 'Sci-Fi', icon: Rocket, color: '#9F7AEA' },
  { id: 'Animation', label: 'Animation', icon: Palette, color: '#F687B3' },
  { id: 'Romance', label: 'Romance', icon: Heart, color: '#ED64A6' },
  { id: 'Thriller', label: 'Thriller', icon: Eye, color: '#F56565' },
];

export const HomePage = memo(({ onSelectMovie, trendingM, trendingS, recommendations, loading, user, onPlayTrailer }: any) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroItems = [...trendingM.slice(0, 5), ...trendingS.slice(0, 5)].filter(Boolean);
  
  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(() => setHeroIndex(prev => (prev + 1) % heroItems.length), 8000);
    return () => clearInterval(interval);
  }, [heroItems.length]);
  
  const featured = heroItems[heroIndex];

  return (
    <div className="pb-32 max-w-5xl mx-auto w-full">
      <section className="mb-6 relative h-[70vh] sm:h-[650px] w-full overflow-hidden bg-[#050505]">
        <AnimatePresence mode="popLayout">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                    <Loader2 className="animate-spin mb-4 text-[#6B46C1]" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loading Cinema...</span>
                </div>
            ) : featured && (
              <motion.div 
                key={featured.id} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1.2, ease: "easeOut" }} 
                className="absolute inset-0"
              >
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] ease-linear" 
                    style={{ 
                      backgroundImage: `url('${featured.backdrop || featured.poster}')`,
                      transform: 'scale(1)' 
                    }} 
                />
                
                {/* Cinema-grade gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-40" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12 z-10 max-w-2xl">
                    <motion.div 
                      initial={{ y: 30, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <span className="inline-block bg-[#6B46C1] text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest mb-4 shadow-lg shadow-purple-900/50">Top Pick</span>
                        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl line-clamp-2">{featured.title}</h2>
                        <div className="flex items-center gap-4">
                            <button 
                              onClick={() => onSelectMovie(featured)} 
                              className="px-10 py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-widest shadow-2xl hover:bg-gray-100"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => onPlayTrailer(featured)} 
                              className="w-16 h-16 rounded-2xl bg-[#6B46C1] flex items-center justify-center text-white shadow-2xl shadow-purple-900/40 active:scale-90 transition-transform hover:bg-[#553C9A]"
                            >
                              <Play size={28} fill="currentColor" />
                            </button>
                        </div>
                    </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </section>

      <div className="px-6 space-y-8">
        {[ 
            { title: "Trending Movies", data: trendingM, icon: Film }, 
            { title: "Popular Shows", data: trendingS, icon: Tv }, 
            { title: "For You", data: recommendations, icon: Sparkles, curated: true } 
        ].map((sec, idx) => (
          <section key={idx}>
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-black flex items-center gap-2 tracking-tight ${sec.curated ? 'text-[#6B46C1]' : 'text-white'}`}>
                    <sec.icon size={20} className={sec.curated ? 'text-[#6B46C1]' : 'text-gray-500'} /> {sec.title}
                </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 scroll-smooth">
                {loading ? [1,2,3,4,5].map(i => <SkeletonCard key={i} />) : sec.data.map((m: any) => (
                    <MovieCard 
                        key={m.id} 
                        movie={m} 
                        onClick={() => onSelectMovie(m)} 
                        isWatched={user?.watched.includes(m.id)} 
                        isInWatchlist={user?.watchlist.some((w: any) => w.id === m.id)} 
                    />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
});

export const ExplorePage = memo(({ onSelectMovie, user }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'show'>('all');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  // Effect 1: Debounced Text Search
  useEffect(() => {
    if (!query.trim()) return;

    const delay = setTimeout(() => { 
        performSearch(query, filter);
    }, 500);
    return () => clearTimeout(delay);
  }, [query, filter]);

  // Effect 2: Immediate Genre/Filter Search (When not text searching)
  useEffect(() => {
    if (query.trim()) return;

    if (activeGenre) {
        performSearch('', filter, activeGenre);
    } else {
        setResults([]);
    }
  }, [activeGenre, filter, query]);

  const performSearch = async (q: string, f: string, g?: string) => {
    setSearching(true);
    try { 
        const data = await API.searchMovies(q, f, user.isKidsMode, g); 
        setResults(data || []); 
    } finally { 
        setSearching(false); 
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (activeGenre) setActiveGenre(null);
  };
  
  const clearSearch = () => {
    setQuery('');
    setActiveGenre(null);
    setResults([]);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="pt-24 px-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="relative mb-8">
            <input 
                type="text" 
                placeholder={activeGenre ? `Browsing ${activeGenre}...` : "Search titles, vibes, genres..."} 
                value={query} 
                onChange={handleSearchChange}
                className={`w-full bg-[#1A1A1A] border rounded-2xl pl-12 pr-12 py-4 outline-none font-bold text-sm text-white focus:border-[#6B46C1] transition-colors placeholder:text-gray-600 shadow-xl ${activeGenre ? 'border-[#6B46C1]/50' : 'border-white/10'}`} 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            {(query || activeGenre) && (
                <button onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
            )}
            {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#6B46C1]" size={20} />}
        </div>
        
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
            {['all', 'movie', 'show'].map((f: any) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-[#6B46C1] text-white border-transparent' : 'bg-[#1A1A1A] text-gray-400 border-white/5'}`}>{f}</button>
            ))}
        </div>

        {results.length === 0 && !searching && (
            <div className="space-y-10">
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Compass size={12} /> DISCOVER BY VIBE</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {SEMANTIC_PROMPTS.map(p => (
                            <button key={p.label} onClick={() => setQuery(p.query)} className="p-3 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center gap-3 group hover:bg-[#222] active:scale-95 transition-all text-left hover:border-[#6B46C1]/50">
                                <div className="w-8 h-8 rounded-full bg-[#6B46C1]/10 flex items-center justify-center text-[#6B46C1] group-hover:scale-110 transition-transform">
                                    <p.icon size={16} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Grid size={12} /> BROWSE GENRES</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {GENRES.map(g => (
                            <button 
                                key={g.id} 
                                onClick={() => { 
                                    setActiveGenre(g.id); 
                                    setQuery(''); 
                                }} 
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all ${activeGenre === g.id ? 'bg-[#6B46C1] border-transparent' : 'bg-[#1A1A1A] border-white/5 hover:border-white/10'}`}
                            >
                                <g.icon size={20} style={{ color: activeGenre === g.id ? 'white' : g.color }} className="transition-colors" />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${activeGenre === g.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{g.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        )}
        
        {results.length > 0 && (
            <motion.div 
              key={(query || activeGenre) + filter} 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
            >
                {results.map(m => (
                    <motion.div key={m.id} variants={itemVariants}>
                      <MovieCard movie={m} onClick={() => onSelectMovie(m)} isWatched={user.watched.includes(m.id)} isInWatchlist={user.watchlist.some((w: any) => w.id === m.id)} fullWidth />
                    </motion.div>
                ))}
            </motion.div>
        )}
    </div>
  );
});

export const LibraryPage = memo(({ user, onSelectMovie }: any) => {
  const [tab, setTab] = useState<'watchlist' | 'watched' | 'favorites'>('watchlist');
  const items = tab === 'watchlist' 
    ? (user.watchlist || []) 
    : (tab === 'watched' ? (user.watchedHistory || []) : (user.favorites || []));
  
  return (
    <div className="pt-24 px-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3 mb-8">
            {[{ label: 'WATCHED', value: user.watched.length, icon: Eye, color: '#6B46C1' }, { label: 'PLANNING', value: user.watchlist.length, icon: Bookmark, color: '#F6AD55' }].map(s => (
                <div key={s.label} className="p-5 bg-[#1A1A1A] rounded-2xl border border-white/5 flex flex-col justify-between h-24">
                    <s.icon size={18} style={{ color: s.color }} />
                    <div><p className="text-2xl font-black text-white">{s.value}</p><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p></div>
                </div>
            ))}
        </div>
        <div className="flex bg-[#1A1A1A] p-1 rounded-xl mb-8 border border-white/5">
            {['watchlist', 'watched', 'favorites'].map((t: any) => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500'}`}>{t}</button>
            ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {items.map((m: any) => (
                <MovieCard key={m.id} movie={m} onClick={() => onSelectMovie(m)} isWatched={user.watched.includes(m.id)} isInWatchlist={user.watchlist.some((w: any) => w.id === m.id)} fullWidth />
            ))}
        </div>
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
               <Inbox size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No movies found</p>
            <p className="text-gray-600 text-[10px] mt-1">Start exploring to add some!</p>
          </div>
        )}
    </div>
  );
});

export const ProfilePage = memo(({ user, setUser, theme, setTheme }: any) => {
  return (
    <div className="pt-24 px-6 pb-32 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6B46C1] to-[#44337A] flex items-center justify-center shadow-2xl mb-4 text-white border-2 border-white/5">
                <UserCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-white">{user.name}</h2>
            <p className="text-gray-500 text-xs font-bold mt-1">{user.email}</p>
        </div>
        
        <div className="space-y-6">
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
                {[
                    { label: 'Kids Mode', icon: Baby, value: user.isKidsMode, toggle: () => setUser({...user, isKidsMode: !user.isKidsMode}) },
                    { label: 'Dark Theme', icon: theme === 'dark' ? Moon : Sun, value: theme === 'dark', toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
                ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-5 ${i !== 1 ? 'border-b border-white/5' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="text-[#6B46C1]"><item.icon size={20} /></div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{item.label}</span>
                        </div>
                        <button onClick={item.toggle} className={`w-12 h-7 rounded-full transition-colors relative ${item.value ? 'bg-[#6B46C1]' : 'bg-[#333]'}`}>
                            <motion.div animate={{ x: item.value ? 22 : 2 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => { localStorage.removeItem('cinesoft_user'); window.location.reload(); }} className="w-full p-4 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform hover:bg-red-500/20">Sign Out</button>
        </div>
    </div>
  );
});
