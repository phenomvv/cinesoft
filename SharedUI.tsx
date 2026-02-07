
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Clapperboard, Star, Check, Bookmark, Home, Search, Library as LibraryIcon, User as UserIcon, Sparkles 
} from 'lucide-react';
import { Movie, User } from './types';

export const getCommunityRating = (movieId: string, baseRating: number) => {
  try {
    const savedUser = localStorage.getItem('cinesoft_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const userRating = user?.userRatings?.[movieId];

    const allRatingsData = localStorage.getItem('cinesoft_global_ratings');
    const db = allRatingsData ? JSON.parse(allRatingsData) : {};
    const entry = db[movieId] || { sum: baseRating * 100, count: 100 };
    
    let finalSum = entry.sum;
    let finalCount = entry.count;
    
    if (userRating) {
      finalSum += userRating * 2;
      finalCount += 1;
    }

    return (finalSum / finalCount).toFixed(1);
  } catch (e) {
    return baseRating.toFixed(1);
  }
};

export const FALLBACK_POSTER = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop";

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] bg-black/80 border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-xs tracking-wide backdrop-blur-xl"
    >
      <div className="bg-[#6B46C1] p-1 rounded-full text-white">
        <Check size={12} strokeWidth={3} />
      </div>
      {message}
    </motion.div>
  );
};

export const GlobalHeader = memo(({ user }: { user: User }) => {
  const navigate = useNavigate();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[150] px-6 flex items-center bg-transparent"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(4rem + env(safe-area-inset-top))',
        pointerEvents: 'none'
      }}
    >
       <div 
         className="flex items-center gap-2 cursor-pointer pointer-events-auto" 
         onClick={() => navigate('/')}
       >
          <div className="p-2 bg-[#6B46C1] rounded-xl shadow-lg shadow-purple-900/40">
            <Clapperboard size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Cine<span className="text-[#6B46C1]">Soft</span>
          </h1>
        </div>
    </header>
  );
});

export const MovieCard = memo(({ 
  movie, 
  onClick, 
  isWatched, 
  isInWatchlist, 
  fullWidth 
}: { 
  movie: Movie; 
  onClick: () => void; 
  isWatched?: boolean; 
  isInWatchlist?: boolean;
  fullWidth?: boolean; 
}) => {
  const [imgSrc, setImgSrc] = useState(movie.poster || FALLBACK_POSTER);

  return (
    <div 
      onClick={onClick} 
      className={`${fullWidth ? 'w-full' : 'flex-shrink-0 w-[130px] sm:w-40'} cursor-pointer group relative touch-manipulation`}
    >
      <div className="relative aspect-[3/4.5] rounded-[1.2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#121212] transition-all duration-300 group-active:scale-95">
        <img 
          src={imgSrc} 
          alt={movie.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          onError={() => setImgSrc(FALLBACK_POSTER)} 
        />
        
        {/* Overlays matching the screenshot style */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-20">
          {isWatched && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white flex items-center justify-center shadow-lg"
            >
              <Check size={12} strokeWidth={4} />
            </motion.div>
          )}
          {isInWatchlist && (
            <div className="w-5 h-5 rounded-full bg-white/90 backdrop-blur-sm text-[#6B46C1] flex items-center justify-center shadow-lg">
              <Bookmark size={10} fill="currentColor" />
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-black text-white z-10 flex items-center gap-1 border border-white/5">
          <Star size={8} className="fill-yellow-400 text-yellow-400" /> {getCommunityRating(movie.id, movie.rating)}
        </div>
      </div>
    </div>
  );
});

export const SkeletonCard = memo(() => (
  <div className="flex-shrink-0 w-[130px] sm:w-40 animate-pulse">
    <div className="aspect-[3/4.5] rounded-[1.2rem] bg-white/5 border border-white/5" />
  </div>
));

export const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', path: '/', icon: Home },
    { id: 'search', path: '/search', icon: Search },
    { id: 'library', path: '/library', icon: LibraryIcon },
    { id: 'profile', path: '/profile', icon: UserIcon }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[200] flex justify-center pointer-events-none pb-[calc(1.5rem + env(safe-area-inset-bottom))]"
    >
      <div className="bg-[#0D0D0D]/90 backdrop-blur-3xl rounded-full flex items-center justify-between p-1 shadow-2xl border border-white/10 pointer-events-auto w-[280px]">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button 
              key={tab.id} 
              onClick={() => navigate(tab.path)} 
              className={`flex-1 relative flex flex-col items-center py-3 rounded-full transition-all duration-300 outline-none ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {active && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-[#6B46C1] rounded-full z-0 shadow-lg shadow-purple-900/40"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <div className="relative z-10 transition-transform active:scale-75">
                <tab.icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
