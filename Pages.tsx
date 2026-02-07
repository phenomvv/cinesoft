
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Loader2, Play, Film, Tv, Sparkles, Search, Compass, Laugh, CloudRain, Rocket, Gem, Ghost, Eye, Bookmark, UserCircle, Baby, Moon, Sun, Inbox, X,
  Zap, Heart, Palette, Grid, ChevronRight
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
    const interval = setInterval(() => setHeroIndex(prev => (prev + 1) % heroItems.length), 10000);
    return () => clearInterval(interval);
  }, [heroItems.length]);
  
  const featured = heroItems[heroIndex];

  return (
    <div className="pb-32 bg-[#050505]">
      {/* Immersive Hero Section Matching the Screenshot */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
            {loading ? (
                <div key="loader" className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-50">
                    <Loader2 className="animate-spin mb-4 text-[#6B46C1]" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Initializing CineSoft...</span>
                </div>
            ) : featured && (
              <motion.div 
                key={featured.id} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1.5 }} 
                className="absolute inset-0"
              >
                {/* Ken Burns Effect Background */}
                <motion.div 
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1.25 }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url('${featured.backdrop || featured.poster}')` }}
                />
                
                {/* Deep Cinema Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 pb-16 z-10 max-w-xl">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#6B46C1] text-white text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-lg shadow-purple-900/50">TOP PICK</span>
                        </div>
                        <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter drop-shadow-2xl">{featured.title}</h2>
                        <div className="flex items-center gap-3">
                            <button 
                              onClick={() => onSelectMovie(featured)} 
                              className="px-8 py-4 bg-[#333333]/80 backdrop-blur-md text-white font-black rounded-full active:scale-95 transition-all text-xs uppercase tracking-[0.2em] hover:bg-[#444]"
                            >
                              DETAILS
                            </button>
                            <button 
                              onClick={() => onPlayTrailer(featured)} 
                              className="w-14 h-14 rounded-2xl bg-[#6B46C1] flex items-center justify-center text-white shadow-xl shadow-purple-900/40 active:scale-90 transition-all hover:bg-[#7c4dff]"
                            >
                              <Play size={24} fill="currentColor" />
                            </button>
                        </div>
                    </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </section>

      {/* Tight Bento Grid Lists */}
      <div className="px-6 -mt-10 relative z-20 space-y-12">
        {[ 
            { title: "Trending Movies", data: trendingM, icon: Film }, 
            { title: "Popular Shows", data: trendingS, icon: Tv }, 
            { title: "AI Recommendations", data: recommendations, icon: Sparkles, color: "text-[#6B46C1]" } 
        ].map((sec, idx) => (
          <section key={idx} className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className={`text-lg font-black flex items-center gap-2.5 tracking-tight ${sec.color || 'text-white'}`}>
                    <sec.icon size={18} className="opacity-40" /> {sec.title}
                </h2>
                <ChevronRight size={18} className="text-white/20" />
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 scroll-smooth">
                {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : sec.data.map((m: any) => (
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

  useEffect(() => {
    if (!query.trim()) return;
    const delay = setTimeout(() => { performSearch(query, filter); }, 500);
    return () => clearTimeout(delay);
  }, [query, filter]);

  useEffect(() => {
    if (query.trim()) return;
    if (activeGenre) { performSearch('', filter, activeGenre); } else { setResults([]); }
  }, [activeGenre, filter, query]);

  const performSearch = async (q: string, f: string, g?: string) => {
    setSearching(true);
    try { 
        const data = await API.searchMovies(q, f, user.isKidsMode, g); 
        setResults(data || []); 
    } finally { setSearching(false); }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (activeGenre) setActiveGenre(null);
  };
  
  const clearSearch = () => { setQuery(''); setActiveGenre(null); setResults([]); };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } }
  };

  return (
    <div className="pt-24 px-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="relative mb-8">
            <input 
                type="text" 
                placeholder={activeGenre ? `Browsing ${activeGenre}...` : "Search titles, vibes..."} 
                value={query} 
                onChange={handleSearchChange}
                className={`w-full bg-[#121212] border rounded-2xl pl-12 pr-12 py-4 outline-none font-bold text-sm text-white focus:border-[#6B46C1] transition-all placeholder:text-gray-600 shadow-2xl border-white/5 ${activeGenre ? 'border-[#6B46C1]/40' : ''}`} 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            {(query || activeGenre) && (
                <button onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"><X size={16} /></button>
            )}
            {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#6B46C1]" size={20} />}
        </div>
        
        <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar">
            {['all', 'movie', 'show'].map((f: any) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-[#6B46C1] text-white border-transparent shadow-lg shadow-purple-900/30' : 'bg-[#121212] text-gray-500 border-white/5'}`}>{f}</button>
            ))}
        </div>

        {results.length === 0 && !searching && (
            <div className="space-y-12">
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2"><Compass size={12} /> CURATED VIBES</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {SEMANTIC_PROMPTS.map(p => (
                            <button key={p.label} onClick={() => setQuery(p.query)} className="p-4 rounded-2xl bg-[#121212] border border-white/5 flex items-center gap-4 group active:scale-95 transition-all text-left hover:border-[#6B46C1]/30">
                                <div className="w-10 h-10 rounded-xl bg-[#6B46C1]/10 flex items-center justify-center text-[#6B46C1] group-hover:bg-[#6B46C1] group-hover:text-white transition-all">
                                    <p.icon size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2"><Grid size={12} /> GENRES</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {GENRES.map(g => (
                            <button 
                                key={g.id} 
                                onClick={() => { setActiveGenre(g.id); setQuery(''); }} 
                                className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 active:scale-95 transition-all ${activeGenre === g.id ? 'bg-[#6B46C1] border-transparent shadow-lg shadow-purple-900/40' : 'bg-[#121212] border-white/5 hover:border-white/10'}`}
                            >
                                <g.icon size={24} style={{ color: activeGenre === g.id ? 'white' : g.color }} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeGenre === g.id ? 'text-white' : 'text-gray-400'}`}>{g.label}</span>
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
              initial="hidden" animate="visible"
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
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
  const items = tab === 'watchlist' ? (user.watchlist || []) : (tab === 'watched' ? (user.watchedHistory || []) : (user.favorites || []));
  
  return (
    <div className="pt-24 px-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3 mb-10">
            {[{ label: 'TOTAL SEEN', value: user.watched.length, icon: Eye, color: '#6B46C1' }, { label: 'WATCHLIST', value: user.watchlist.length, icon: Bookmark, color: '#F6AD55' }].map(s => (
                <div key={s.label} className="p-6 bg-[#121212] rounded-[1.5rem] border border-white/5 flex flex-col justify-between h-28 shadow-xl">
                    <s.icon size={20} style={{ color: s.color }} />
                    <div><p className="text-3xl font-black text-white leading-none mb-1">{s.value}</p><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p></div>
                </div>
            ))}
        </div>
        <div className="flex bg-[#121212] p-1.5 rounded-2xl mb-10 border border-white/5 shadow-2xl">
            {['watchlist', 'watched', 'favorites'].map((t: any) => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-[#222] text-white shadow-xl' : 'text-gray-500'}`}>{t}</button>
            ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {items.map((m: any) => (
                <MovieCard key={m.id} movie={m} onClick={() => onSelectMovie(m)} isWatched={user.watched.includes(m.id)} isInWatchlist={user.watchlist.some((w: any) => w.id === m.id)} fullWidth />
            ))}
        </div>
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
               <Inbox size={32} className="text-white/20" />
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Library Empty</p>
            <p className="text-gray-600 text-[10px] mt-2">Start curating your cinema journey</p>
          </div>
        )}
    </div>
  );
});

export const ProfilePage = memo(({ user, setUser }: any) => {
  return (
    <div className="pt-24 px-6 pb-32 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-[#6B46C1] to-[#44337A] flex items-center justify-center shadow-2xl mb-6 text-white border-4 border-white/10 overflow-hidden">
                <UserCircle size={60} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">{user.name}</h2>
            <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">{user.email}</p>
        </div>
        
        <div className="space-y-6">
            <div className="bg-[#121212] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                {[
                    { label: 'Kids Mode', icon: Baby, value: user.isKidsMode, toggle: () => setUser({...user, isKidsMode: !user.isKidsMode}) },
                ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-6`}>
                        <div className="flex items-center gap-4">
                            <div className="text-[#6B46C1] bg-[#6B46C1]/10 p-3 rounded-2xl"><item.icon size={24} /></div>
                            <span className="text-sm font-black text-white uppercase tracking-widest">{item.label}</span>
                        </div>
                        <button onClick={item.toggle} className={`w-14 h-8 rounded-full transition-all relative ${item.value ? 'bg-[#6B46C1]' : 'bg-[#333]'}`}>
                            <motion.div animate={{ x: item.value ? 26 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg" />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => { localStorage.removeItem('cinesoft_user'); window.location.reload(); }} className="w-full p-5 bg-red-500/10 text-red-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all hover:bg-red-500/20">Sign Out</button>
        </div>
    </div>
  );
});
