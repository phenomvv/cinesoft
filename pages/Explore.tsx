
import React, { useState, useEffect, memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Loader2, Search, Compass, Laugh, CloudRain, Rocket, Gem, Ghost, Eye, X,
  Zap, Heart, Palette, Grid, Film
} from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import * as GeminiAPI from '../services/gemini';
import * as TmdbAPI from '../services/tmdb';

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
