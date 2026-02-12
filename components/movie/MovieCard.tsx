
import React, { memo, useState } from 'react';
import { Check, Bookmark, Star, Calendar } from 'lucide-react';
import { Movie } from '../../types';
import { triggerHaptic, getCommunityRating, FALLBACK_POSTER } from '../../utils';

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
  
  const isUnreleased = movie.releaseDate ? new Date(movie.releaseDate) > new Date() : false;
  const formattedDate = movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <div 
      onClick={handleClick} 
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
          {isUnreleased && (
            <div className="px-2 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center border border-white/10 shadow-lg text-[7px] font-black uppercase tracking-widest whitespace-nowrap">Coming</div>
          )}
        </div>

        {isUnreleased ? (
            <div className="absolute bottom-2 right-2 bg-orange-600/80 backdrop-blur-sm px-2 py-1 rounded-md text-[8px] font-black shadow-lg flex items-center gap-1 text-white z-10 border border-white/10">
                <Calendar size={8} /> {formattedDate}
            </div>
        ) : (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-black shadow-lg flex items-center gap-1 text-white z-10 border border-white/10 group-hover:bg-[#6B46C1] group-hover:border-[#6B46C1] group-hover:text-white transition-colors">
                <Star size={8} className="fill-yellow-400 text-yellow-400 group-hover:text-white group-hover:fill-white" /> {getCommunityRating(movie.id, movie.rating)}
            </div>
        )}
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
