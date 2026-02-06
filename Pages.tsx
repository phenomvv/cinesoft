import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Loader2, Play, Film, Tv, Sparkles, Search, Compass, Laugh, CloudRain, Rocket, Gem, Ghost, Eye, Bookmark, UserCircle, Baby, Moon, Sun, Inbox 
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
      <section className="mb-12 relative h-[75vh] sm:h-[600px] w-full overflow-hidden bg-slate-950">
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
                transition={{ duration: 0.8 }} 
                className="absolute inset-0"
              >
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-100 opacity-60" 
                    style={{ backgroundImage: `url('${featured.poster}')`, transform: 'scale(1.05)' }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 pb-12 z-10 max-w-2xl">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <span className="inline-block bg-[#6B46C1] text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest mb-4 shadow-lg shadow-purple-900/50">Top Pick</span>
                        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-lg line-clamp-2">{featured.title}</h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => onSelectMovie(featured)} className="px-8 py-3.5 bg-white text-black font-black rounded-xl active:scale-95 transition-transform text-xs uppercase tracking-widest shadow-xl hover:bg-gray-100">Details</button>
                            <button onClick={() => featured.trailerUrl && onPlayTrailer(featured.trailerUrl)} className="w-12 h-12 rounded-xl bg-[#6B46C1] flex items-center justify-center text-white shadow-xl shadow-purple-900/30 active:scale-90 transition-transform hover:bg-[#553C9A]"><Play size={20} fill="currentColor" /></button>
                        </div>
                    </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </section>

      <div className="px-6 space-y-12">
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

  useEffect(() => {
    const delay = setTimeout(() => { if (query.trim()) performSearch(query, filter); else setResults([]); }, 500);
    return () => clearTimeout(delay);
  }, [query, filter]);

  const performSearch = async (q: string, f: string) => {
    setSearching(true);
    try { const data = await API.searchMovies(q, f, user.isKidsMode); setResults(data || []); } finally { setSearching(false); }
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
            <input type="text" placeholder="Search titles, vibes, genres..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl pl-12 pr-12 py-4 outline-none font-bold text-sm text-white focus:border-[#6B46C1] transition-colors placeholder:text-gray-600 shadow-xl" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#6B46C1]" size={20} />}
        </div>
        
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
            {['all', 'movie', 'show'].map((f: any) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-[#6B46C1] text-white border-transparent' : 'bg-[#1A1A1A] text-gray-400 border-white/5'}`}>{f}</button>
            ))}
        </div>

        {results.length === 0 && !searching && (
            <div className="space-y-8">
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Compass size={12} /> DISCOVER BY VIBE</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SEMANTIC_PROMPTS.map(p => (
                            <button key={p.label} onClick={() => setQuery(p.query)} className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/5 flex flex-col gap-3 items-start group hover:bg-[#222] active:scale-95 transition-all text-left">
                                <p.icon size={20} className="text-[#6B46C1]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        )}
        
        {results.length > 0 && (
            <motion.div 
              key={query + filter} 
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