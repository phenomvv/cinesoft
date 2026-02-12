
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Film, Tv, Sparkles, CalendarDays, TrendingUp } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { SkeletonCard } from '../components/ui/Common';
import * as GeminiAPI from '../services/gemini';
import * as TmdbAPI from '../services/tmdb';
import { Movie } from '../types';

const API = TmdbAPI.hasApiKey() ? TmdbAPI : GeminiAPI;

interface HomePageProps {
  onSelectMovie: (movie: Movie) => void;
  trendingM: Movie[];
  trendingS: Movie[];
  anticipatedM: Movie[];
  recommendations: Movie[];
  loading: boolean;
  user: any;
  onPlayTrailer: (movie: Movie) => void;
}

export const HomePage = memo(({ onSelectMovie, trendingM, trendingS, anticipatedM, recommendations, loading, user, onPlayTrailer }: HomePageProps) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [featuredLogos, setFeaturedLogos] = useState<Record<string, string>>({});
  
  const heroItems = [...trendingM.slice(0, 5), ...trendingS.slice(0, 5)].filter(Boolean);
  
  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(() => setHeroIndex(prev => (prev + 1) % heroItems.length), 8000);
    return () => clearInterval(interval);
  }, [heroItems.length]);
  
  const featured = heroItems[heroIndex];

  useEffect(() => {
    if (!featured) return;
    if (featured.logo) {
        setFeaturedLogos(prev => ({ ...prev, [featured.id]: featured.logo! }));
        return;
    }
    if (featuredLogos[featured.id]) return;

    API.fetchMovieDetails(featured.id, featured.type).then((details: any) => {
        if (details?.logo) {
            setFeaturedLogos(prev => ({ ...prev, [featured.id]: details.logo! }));
        }
    });
  }, [featured]);

  const activeLogo = featured ? featuredLogos[featured.id] : undefined;

  const sections = [
    { title: "Top 10 Movies Today", data: trendingM.slice(0, 10), icon: TrendingUp },
    { title: "Top 10 Shows Today", data: trendingS.slice(0, 10), icon: TrendingUp },
    { title: "Anticipated Releases", data: anticipatedM, icon: CalendarDays, highlighted: true },
    { title: "Trending Now", data: trendingM.slice(10), icon: Film }, 
    { title: "Popular Shows", data: trendingS.slice(10), icon: Tv }, 
    { title: "For You", data: recommendations, icon: Sparkles, curated: true } 
  ];

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
                        
                        {activeLogo ? (
                          <motion.img 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            src={activeLogo} 
                            alt={featured.title} 
                            className="max-w-[70%] max-h-40 object-contain mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] origin-bottom-left" 
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
        {sections.map((sec, idx) => (
          <section key={idx}>
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-black flex items-center gap-2 tracking-tight ${sec.curated ? 'text-[#6B46C1]' : sec.highlighted ? 'text-orange-400' : 'text-white'}`}>
                    <sec.icon size={20} className={sec.curated ? 'text-[#6B46C1]' : sec.highlighted ? 'text-orange-400' : 'text-gray-500'} /> {sec.title}
                </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 scroll-smooth">
                {loading ? [1,2,3,4,5].map(i => <SkeletonCard key={i} />) : sec.data.map((m: any, i: number) => (
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
