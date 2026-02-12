import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, Play, Film, Tv, Sparkles, Search, Compass, Laugh, CloudRain, Rocket, Gem, Ghost, Eye, Bookmark, UserCircle, Baby, Moon, Sun, Inbox, X,
  Zap, Heart, Palette, Grid, CalendarDays, Clapperboard, LayoutGrid, Settings, Trophy, Popcorn, PlayCircle, HelpCircle, ChevronLeft, Globe, LogOut, ShieldCheck, Mail
} from 'lucide-react';
import { MovieCard, SkeletonCard, triggerHaptic, GoogleLogo } from './SharedUI';
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

export const LandingPage = ({ onLogin, onGuest }: { onLogin: (type: 'google' | 'email') => void, onGuest: () => void }) => {
  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-end pb-12">
      {/* Background with slow subtle zoom */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </motion.div>

      <div className="relative z-10 w-full max-w-md px-8 flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-[#6B46C1] rounded-2xl shadow-[0_0_30px_rgba(107,70,193,0.4)]">
              <Clapperboard size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">CineSoft</h1>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Cinema, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B46C1] to-[#9F7AEA]">Curated.</span>
          </h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            Track your watchlist, discover hidden gems with AI, and experience movies like never before.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-3 w-full"
        >
          <button 
            onClick={() => onLogin('google')}
            className="w-full py-4 bg-white rounded-2xl flex items-center justify-center gap-3 text-black font-black text-sm active:scale-95 transition-transform hover:bg-gray-100 shadow-xl"
          >
            <GoogleLogo />
            Continue with Google
          </button>
          
          <button 
            onClick={() => onLogin('email')}
            className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm active:scale-95 transition-transform hover:bg-white/20"
          >
            <Mail size={18} />
            Sign in with Email
          </button>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onGuest}
          className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Continue as Guest
        </motion.button>
      </div>
    </div>
  );
};

export const HomePage = memo(({ onSelectMovie, trendingM, trendingS, anticipatedM, recommendations, loading, user, onPlayTrailer }: any) => {
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
      <section className="mb-4 relative h-[65vh] sm:h-[550px] w-full overflow-hidden bg-[#050505]">
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
                      transform: 'scale(1.1)' 
                    }} 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12 z-10 max-w-2xl">
                    <motion.div 
                      initial={{ y: 30, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <span className="inline-block bg-[#6B46C1] text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest mb-4 shadow-lg shadow-purple-900/50">Top Pick</span>
                        
                        {featured.logo ? (
                          <img 
                            src={featured.logo} 
                            alt={featured.title} 
                            className="max-w-[80%] max-h-32 object-contain mb-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" 
                          />
                        ) : (
                          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl line-clamp-2">{featured.title}</h2>
                        )}

                        <div className="flex items-center gap-4">
                            <button 
                              onClick={() => onSelectMovie(featured)} 
                              className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-widest shadow-2xl hover:bg-gray-100"
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
            { title: "Anticipated Releases", data: anticipatedM, icon: CalendarDays, highlighted: true },
            { title: "Popular Shows", data: trendingS, icon: Tv }, 
            { title: "For You", data: recommendations, icon: Sparkles, curated: true } 
        ].map((sec, idx) => (
          <section key={idx}>
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-black flex items-center gap-2 tracking-tight ${sec.curated ? 'text-[#6B46C1]' : sec.highlighted ? 'text-orange-400' : 'text-white'}`}>
                    <sec.icon size={20} className={sec.curated ? 'text-[#6B46C1]' : sec.highlighted ? 'text-orange-400' : 'text-gray-500'} /> {sec.title}
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

  useEffect(() => {
    if (!query.trim()) return;
    const delay = setTimeout(() => { 
        performSearch(query, filter);
    }, 500);
    return () => clearTimeout(delay);
  }, [query, filter]);

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
                className={`w-full bg-[#1A1A1A] border rounded-2xl pl-12 pr-12 py-4 outline-none font-bold text-sm text-white focus:border-[#6B46C1] transition-colors placeholder:text-gray-600 shadow-xl border-white/10 ${activeGenre ? 'border-[#6B46C1]/50' : ''}`} 
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
                            <button key={p.label} onClick={() => setQuery(p.query)} className="p-3 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center gap-3 group hover:bg-[#222] active:scale-95 transition-all text-left hover:border-[#6B46C1]/50 shadow-sm">
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
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all shadow-sm ${activeGenre === g.id ? 'bg-[#6B46C1] border-transparent' : 'bg-[#1A1A1A] border-white/5 hover:border-[#6B46C1]/30'}`}
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
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'show'>('all');

  const baseItems = tab === 'watchlist' 
    ? (user.watchlist || []) 
    : (tab === 'watched' ? (user.watchedHistory || []) : (user.favorites || []));
  
  const filteredItems = baseItems.filter((m: any) => {
    if (mediaFilter === 'all') return true;
    return m.type === mediaFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'movie', label: 'Movies', icon: Clapperboard },
    { id: 'show', label: 'Shows', icon: Tv }
  ];

  const handleTabChange = (t: any) => {
    triggerHaptic('light');
    setTab(t);
  };

  const handleFilterChange = (f: any) => {
    triggerHaptic('light');
    setMediaFilter(f);
  };

  return (
    <div className="pt-24 px-6 pb-32 max-w-5xl mx-auto w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: 'WATCHED', value: user.watched.length, icon: Eye, color: '#6B46C1' }, 
              { label: 'PLANNING', value: user.watchlist.length, icon: Bookmark, color: '#F6AD55' }
            ].map(s => (
                <div key={s.label} className="p-5 bg-[#1A1A1A] rounded-2xl border border-white/5 flex flex-col justify-between h-24 shadow-sm">
                    <s.icon size={18} style={{ color: s.color }} />
                    <div><p className="text-2xl font-black text-white">{s.value}</p><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p></div>
                </div>
            ))}
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#1A1A1A] p-1 rounded-2xl mb-4 border border-white/5 shadow-sm">
            {['watchlist', 'watched', 'favorites'].map((t: any) => (
                <button 
                  key={t} 
                  onClick={() => handleTabChange(t)} 
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-[#333] text-white shadow-lg' : 'text-gray-500'}`}
                >
                  {t}
                </button>
            ))}
        </div>

        {/* Media Type Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar py-1">
          {filterOptions.map(f => (
            <button 
              key={f.id} 
              onClick={() => handleFilterChange(f.id)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95 ${
                mediaFilter === f.id 
                  ? 'bg-[#6B46C1] text-white border-transparent shadow-lg shadow-purple-900/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
              }`}
            >
              <f.icon size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Grid Content */}
        <motion.div 
          layout 
          className="grid grid-cols-3 sm:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((m: any) => (
              <motion.div 
                key={m.id} 
                layout 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <MovieCard movie={m} onClick={() => onSelectMovie(m)} isWatched={user.watched.includes(m.id)} isInWatchlist={user.watchlist.some((w: any) => w.id === m.id)} fullWidth />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
               <Inbox size={32} className="text-gray-500/50" />
            </div>
            <p className="text-gray-300 text-xs font-black uppercase tracking-widest">No titles match</p>
            <p className="text-gray-600 text-[10px] mt-2 font-bold max-w-[200px] leading-relaxed">
              Your {tab} is empty for {mediaFilter === 'all' ? 'everything' : mediaFilter + 's'}. 
              Explore and add some!
            </p>
          </motion.div>
        )}
    </div>
  );
});

export const ProfilePage = memo(({ user, setUser, onSelectMovie }: any) => {
  const navigate = useNavigate();
  
  const moviesSeen = user.watched.length;
  const hrsWatched = Math.floor((moviesSeen * 102) / 60);
  
  const getRank = (count: number) => {
    if (count > 50) return "Film Critic";
    if (count > 20) return "Cinemaniac";
    if (count > 5) return "Film Student";
    return "Casual Viewer";
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as any }
    })
  };

  const achievementIcons = [
    { icon: Trophy, color: "#FACC15" },
    { icon: Clapperboard, color: "#A78BFA" },
    { icon: Popcorn, color: "#FB923C" },
    { icon: PlayCircle, color: "#4ADE80" },
    { icon: HelpCircle, color: "#94A3B8" }
  ];

  return (
    <div className="pt-28 px-6 pb-40 max-w-xl mx-auto w-full min-h-screen bg-[#050505] overflow-x-hidden">
        {/* Settings Gear */}
        <button 
            onClick={() => {
              triggerHaptic('medium');
              navigate('/settings');
            }} 
            className="fixed top-0 right-6 z-[250] text-white/50 hover:text-white transition-all p-3 rounded-full active:scale-90"
            style={{ 
                marginTop: 'calc(1.4rem + env(safe-area-inset-top))',
            }}
        >
            <Settings size={24} />
        </button>

        {/* Profile Identity */}
        <motion.div 
            initial="hidden" animate="visible" custom={1} variants={staggerVariants}
            className="flex flex-col items-center mb-10 text-center"
        >
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#8B5CF6] via-[#6B46C1] to-[#4C1D95] flex items-center justify-center shadow-[0_20px_50px_rgba(107,70,193,0.3)] mb-4 border border-white/20">
                <UserCircle size={48} strokeWidth={1.5} className="text-white/90" />
            </div>
            <h2 className="text-3xl font-black text-white leading-none">{user.name}</h2>
            <p className="text-gray-500 text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">{user.email}</p>
        </motion.div>
        
        {/* Stats Bento Box */}
        <motion.div 
            initial="hidden" animate="visible" custom={2} variants={staggerVariants}
            className="mb-8"
        >
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">STATS</h3>
            <div className="grid grid-cols-3 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-black text-white">{hrsWatched.toLocaleString()}</span>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1 opacity-70">hrs watched</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-white/5">
                    <span className="text-xl font-black text-white">{moviesSeen}</span>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1 opacity-70">movies seen</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-black text-white">Film</span>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1 opacity-70">{getRank(moviesSeen)} rank</span>
                </div>
            </div>
        </motion.div>

        {/* Achievements Bento Box */}
        <motion.div 
            initial="hidden" animate="visible" custom={3} variants={staggerVariants}
            className="mb-10"
        >
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">ACHIEVEMENTS</h3>
            <div className="flex items-center justify-between bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-xl gap-4">
                {achievementIcons.map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => triggerHaptic('medium')}
                        className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-90 relative group"
                        style={{ outline: i === 0 ? '2px solid #6B46C1' : 'none', outlineOffset: '2px' }}
                    >
                        <item.icon size={18} style={{ color: item.color }} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "opacity-100" : "opacity-30"} />
                        {i < 4 && <div className="absolute inset-0 rounded-full bg-current opacity-10 blur-sm group-hover:blur-md" style={{ color: item.color }} />}
                    </button>
                ))}
            </div>
        </motion.div>

        {/* Favorite Movies Bento Box */}
        <motion.div 
            initial="hidden" animate="visible" custom={4} variants={staggerVariants}
            className="mb-12"
        >
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">FAVORITE MOVIES</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
                {(user.favorites && user.favorites.length > 0) ? (
                    user.favorites.slice(0, 3).map((m: any) => (
                        <MovieCard key={m.id} movie={m} onClick={() => onSelectMovie(m)} fullWidth />
                    ))
                ) : (
                    [1, 2, 3].map(i => (
                        <div key={i} className="aspect-[2/3] bg-[#0A0A0A] border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-gray-700">
                            <Plus size={24} />
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-center">
                <button 
                    onClick={() => { triggerHaptic('light'); navigate('/library'); }}
                    className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800 pb-1 hover:text-white transition-colors"
                >
                    See All Favorites
                </button>
            </div>
        </motion.div>
    </div>
  );
});

export const SettingsPage = memo(({ user, setUser }: any) => {
  const navigate = useNavigate();
  const languages = ["English", "Spanish", "French", "German", "Japanese"];

  const handleSignOut = () => {
    triggerHaptic('heavy');
    localStorage.removeItem('cinesoft_user');
    window.location.reload();
  };

  const toggleKidsMode = () => {
    triggerHaptic('medium');
    setUser({ ...user, isKidsMode: !user.isKidsMode });
  };

  const handleLanguageChange = (lang: string) => {
    triggerHaptic('light');
    setUser({ ...user, language: lang });
  };

  const handleLogin = (type: 'google' | 'email') => {
    triggerHaptic('medium');
    const mockUser = {
      ...user,
      name: type === 'google' ? 'Alex Chen' : 'Alex Chen',
      email: type === 'google' ? 'alex.c@gmail.com' : 'alex@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    };
    setUser(mockUser);
    localStorage.setItem('cinesoft_user', JSON.stringify(mockUser));
  };

  const isGuest = user.email.includes('guest') || !user.email;

  return (
    <div className="pt-24 px-6 pb-32 max-w-xl mx-auto w-full min-h-screen bg-[#050505] overflow-x-hidden">
        {/* Back Button */}
        <button 
            onClick={() => { triggerHaptic('light'); navigate(-1); }}
            className="flex items-center gap-2 mb-8 text-gray-500 hover:text-white transition-colors p-1"
        >
            <ChevronLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <h2 className="text-3xl font-black text-white mb-10 tracking-tight uppercase">Settings</h2>

        <div className="space-y-6">
            {/* Account Section */}
            <section>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">ACCOUNT</h3>
                
                {isGuest ? (
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl p-6">
                    <div className="mb-6">
                      <h4 className="text-white font-black text-lg mb-1">Sync your library</h4>
                      <p className="text-gray-500 text-xs">Sign in to save your watchlist across devices.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleLogin('google')}
                        className="w-full py-3 bg-white rounded-xl flex items-center justify-center gap-2 text-black font-black text-xs active:scale-95 transition-transform"
                      >
                        <GoogleLogo />
                        Continue with Google
                      </button>
                      <button 
                        onClick={() => handleLogin('email')}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white font-black text-xs active:scale-95 transition-transform hover:bg-white/10"
                      >
                        <Mail size={16} />
                        Sign in with Email
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
                      <div className="p-6 flex items-center gap-4 border-b border-white/5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#4C1D95] flex items-center justify-center text-white border border-white/10 overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <UserCircle size={28} />
                              )}
                          </div>
                          <div>
                              <p className="text-white font-black text-sm">{user.name}</p>
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{user.email}</p>
                          </div>
                      </div>
                      <button 
                          onClick={handleSignOut}
                          className="w-full p-5 flex items-center gap-4 text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                          <div className="p-2 bg-red-500/10 rounded-xl"><LogOut size={18} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out Account</span>
                      </button>
                  </div>
                )}
            </section>

            {/* Preferences Section */}
            <section>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">PREFERENCES</h3>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl divide-y divide-white/5">
                    {/* Kids Mode Toggle */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#6B46C1]/10 text-[#6B46C1] rounded-xl"><Baby size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Kids Mode</span>
                                <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Filtered content</span>
                            </div>
                        </div>
                        <button 
                            onClick={toggleKidsMode} 
                            className={`w-12 h-7 rounded-full transition-all relative shadow-inner ${user.isKidsMode ? 'bg-[#6B46C1]' : 'bg-[#333]'}`}
                        >
                            <motion.div animate={{ x: user.isKidsMode ? 22 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md" />
                        </button>
                    </div>

                    {/* Language Selector */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><Globe size={18} /></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Language</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {languages.map(lang => (
                                <button 
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        user.language === lang 
                                            ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-900/20' 
                                            : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* System Section */}
            <section>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">SYSTEM</h3>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-500/10 text-gray-500 rounded-xl"><ShieldCheck size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Security</span>
                                <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Encrypted local storage</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">CineSoft v1.1.0 — Build 2025.04</p>
                </div>
            </section>
        </div>
    </div>
  );
});

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);