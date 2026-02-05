import React, { useState, useEffect, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Clapperboard, Star, Check, Bookmark, Home, Search, Library as LibraryIcon, User as UserIcon, Sparkles 
} from 'lucide-react';
import { Movie, User } from './types';

export const getCommunityRating = (movieId: string, baseRating: number) => {
  try {
    const allRatingsData = localStorage.getItem('cinesoft_global_ratings');
    const db = allRatingsData ? JSON.parse(allRatingsData) : {};
    const entry = db[movieId] || { sum: baseRating * 100, count: 100 };
    return (entry.sum / entry.count).toFixed(1);
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
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] bg-[#1A1A1A] border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-xs tracking-wide backdrop-blur-md"
    >
      <div className="bg-[#6B46C1] p-1 rounded-full text-white shadow-lg shadow-purple-900/50">
        <Check size={12} strokeWidth={3} />
      </div>
      {message}
    </motion.div>
  );
};

export const Button = memo(({ children, onClick, className = "", variant = "primary", disabled = false }: any) => {
  const base = "px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-xs transition-transform duration-100 active:scale-95";
  const variants: any = {
    primary: "bg-[#6B46C1]/10 text-[#6B46C1]",
    secondary: "bg-[#F0FFF4] text-[#2F855A] dark:bg-[#2D353E] dark:text-[#F0FFF4]",
    accent: "bg-[#FFF5F5] text-[#C53030] dark:bg-[#3E2D2D] dark:text-[#FFF5F5]",
    dark: "bg-black/80 text-white dark:bg-white/10 dark:text-white border border-white/10",
    pro: "bg-gradient-to-r from-[#6B46C1] to-[#805AD5] text-white shadow-lg shadow-purple-500/20"
  };
  return (
    <button 
      onClick={onClick} 
      className={`${base} ${variants[variant]} ${className}`} 
      disabled={disabled}
    >
      {children}
    </button>
  );
});

export const GlobalHeader = memo(({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const root = document.getElementById('root');
    const handleScroll = () => {
      if (root) {
        setIsScrolled(root.scrollTop > 20);
      }
    };
    
    if (root) {
      root.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (root) root.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header 
      // Ensure top: 0 and absolute/fixed positioning
      className={`fixed top-0 left-0 right-0 z-[150] px-6 flex items-center pointer-events-none transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}
      style={{ 
        // Height covers header content + notch safe area
        height: 'calc(4rem + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        marginTop: 0 // Explicitly zero out margin
      }}
    >
       <div 
         className={`flex items-center gap-2 cursor-pointer pointer-events-auto transition-transform duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`} 
         onClick={() => navigate('/')}
       >
          <div className={`p-2 bg-[#6B46C1] rounded-lg shadow-lg shadow-purple-900/30`}>
            <Clapperboard size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none text-white drop-shadow-md">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B46C1] to-[#9F7AEA]">Soft</span>
            </h1>
          </div>
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
      className={`${fullWidth ? 'w-full' : 'flex-shrink-0 w-32 sm:w-36'} cursor-pointer group relative transform transition-transform duration-300 hover:-translate-y-1 active:scale-95 touch-manipulation`}
    >
      <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden shadow-xl border border-white/5 bg-gray-800 transition-all will-change-transform group-hover:border-[#6B46C1]/50 group-hover:shadow-[#6B46C1]/20">
        <img 
          src={imgSrc} 
          alt={movie.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={() => setImgSrc(FALLBACK_POSTER)} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 left-2 flex flex-row gap-1 z-30 pointer-events-none">
          {isWatched && (
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-white/10 shadow-lg"><Check size={12} /></div>
          )}
          {isInWatchlist && (
            <div className="w-6 h-6 rounded-full bg-white text-[#6B46C1] flex items-center justify-center border border-white/10 shadow-lg"><Bookmark size={10} fill="currentColor" /></div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-black shadow-lg flex items-center gap-1 text-white z-10 border border-white/10 group-hover:bg-[#6B46C1] group-hover:border-[#6B46C1] transition-colors">
          <Star size={8} className="fill-yellow-400 text-yellow-400 group-hover:text-white group-hover:fill-white" /> {getCommunityRating(movie.id, movie.rating)}
        </div>
      </div>
      <div className="mt-2.5 px-1">
        <h3 className="text-xs font-bold truncate text-gray-100 group-hover:text-[#6B46C1] transition-colors">{movie.title}</h3>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
          {movie.year} {movie.type === 'show' && <span className="text-[8px] bg-white/10 px-1 rounded text-white/50">TV</span>}
        </p>
      </div>
    </div>
  );
});

export const SkeletonCard = memo(() => (
  <div className="flex-shrink-0 w-32 sm:w-36 animate-pulse">
    <div className="aspect-[2/3] rounded-[1.5rem] bg-white/5 mb-2 border border-white/5" />
    <div className="h-3 bg-white/5 rounded-full w-3/4 mb-1" />
  </div>
));

export const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', path: '/', icon: Home, label: 'HOME' },
    { id: 'search', path: '/search', icon: Search, label: 'EXPLORE' },
    { id: 'library', path: '/library', icon: LibraryIcon, label: 'LIBRARY' },
    { id: 'profile', path: '/profile', icon: UserIcon, label: 'PROFILE' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] px-6 pb-6 flex justify-center pointer-events-none">
      <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-full flex items-center justify-between p-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/10 pointer-events-auto max-w-[320px] w-full">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button 
              key={tab.id} 
              onClick={() => navigate(tab.path)} 
              className={`flex-1 relative flex flex-col items-center gap-0.5 py-3 rounded-full transition-all duration-300 outline-none ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {active && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-[#6B46C1] rounded-full z-0 shadow-lg shadow-purple-900/30"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5 transform transition-transform active:scale-90">
                <tab.icon size={18} strokeWidth={active ? 2.5 : 2} />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});