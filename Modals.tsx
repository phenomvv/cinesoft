
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  X, Star, Play, CheckCircle2, Heart, PlayCircle, ChevronDown, Check, BarChart3, Sparkles, Loader2, Bookmark, User as UserIcon, MonitorPlay 
} from 'lucide-react';
import { Movie, Episode, Person, Season, StreamingPlatform } from './types';
import * as GeminiAPI from './geminiService';
import * as TmdbAPI from './tmdbService';
import { FALLBACK_POSTER, getCommunityRating, MovieCard } from './SharedUI';

const API = TmdbAPI.hasApiKey() ? TmdbAPI : GeminiAPI;

const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalContent: Variants = {
  initial: { opacity: 1, y: "110%" },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', damping: 25, stiffness: 350, mass: 0.8 } 
  },
  exit: { 
    opacity: 1, 
    y: "110%", 
    transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } 
  }
};

export const VideoModal = ({ url, onClose }: any) => {
  const [loading, setLoading] = useState(true);
  
  const getVideoId = (u: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = u.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(url);
  const embedUrl = videoId 
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3` 
    : url;
  
  return (
    <motion.div 
      initial="initial" animate="animate" exit="exit" variants={modalOverlay} 
      className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
    >
      <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white z-[1010] active:scale-90 transition-transform hover:bg-white/20">
        <X size={24} />
      </button>
      
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <motion.div variants={modalContent} className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-[#6B46C1]" size={32} /></div>}
          <iframe 
            src={embedUrl} 
            title="Trailer" 
            onLoad={() => setLoading(false)} 
            className="w-full h-full" 
            allowFullScreen 
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

const EpisodeDetailModal = memo(({ episode, seasonNumber, showTitle, onClose, isWatched, onToggleWatch }: any) => {
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GeminiAPI.getAIOpinion(`${showTitle} Season ${seasonNumber} Episode ${episode.number}: ${episode.title}`)
      .then(opinion => { setAiAnalysis(opinion); setLoading(false); })
      .catch(() => setLoading(false));
  }, [episode.id, showTitle, seasonNumber]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: "100%" }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: "100%" }} 
      transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
      className="absolute inset-0 z-[500] bg-[#0A0A0A] flex flex-col overflow-hidden"
    >
      <div className="relative aspect-video w-full flex-shrink-0 bg-gray-900">
        <img src={episode.thumbnail || FALLBACK_POSTER} className="w-full h-full object-cover" alt={episode.title} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent" />
        <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"><ChevronDown size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B46C1] mb-1">S{seasonNumber} • E{episode.number}</h3>
            <h2 className="text-2xl font-black text-white leading-tight">{episode.title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onToggleWatch} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isWatched ? 'bg-[#6B46C1] text-white' : 'bg-white/10 text-white border border-white/10'}`}>
            <Check size={16} strokeWidth={3} className={isWatched ? 'opacity-100' : 'opacity-40'} /> {isWatched ? 'SEEN' : 'MARK SEEN'}
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-gray-300 border border-white/5 font-black text-[10px] uppercase tracking-widest"><BarChart3 size={14} /> ANALYZE</button>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{episode.overview}</p>
        <section className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-[#6B46C1] mb-2 flex items-center gap-2"><Sparkles size={12} /> AI INSIGHT</h4>
          {loading ? <div className="h-10 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-white/20" /></div> : <p className="text-xs text-gray-400 leading-relaxed">{aiAnalysis}</p>}
        </section>
      </div>
    </motion.div>
  );
});

export const MovieDetailModal = memo(({ movie: initialMovie, onClose, user, setUser, onToggleWatchlist, onToggleWatched, onToggleFavorite, onSelectPerson, onPlayTrailer, onShowToast }: any) => {
  const [movie, setMovie] = useState<Movie | null>(initialMovie);
  const [activeSeason, setActiveSeason] = useState(1);
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>(user.watchedEpisodes || []);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (initialMovie) { 
      API.fetchMovieDetails(initialMovie.id, initialMovie.type).then(d => { 
        if(d) setMovie(p => p ? ({...p, ...d}) : d);
      }); 
    }
  }, [initialMovie]);

  if (!movie || !user) return null;
  
  const isInW = user.watchlist.some((m: Movie) => m.id === movie.id);
  const isW = user.watched.includes(movie.id);
  const isFav = user.favoriteMovieIds?.includes(movie.id);

  const handleToggleFav = () => {
    onToggleFavorite(movie);
    onShowToast(!isFav ? "Added to Favorites" : "Removed from Favorites");
  };

  const toggleEpisode = (epId: string) => {
    const updated = watchedEpisodes.includes(epId) ? watchedEpisodes.filter(id => id !== epId) : [...watchedEpisodes, epId];
    setWatchedEpisodes(updated);
    setUser({ ...user, watchedEpisodes: updated });
  };

  const handleWatchlist = () => {
    onToggleWatchlist(movie);
    onShowToast(!isInW ? "Added to Watchlist" : "Removed from Watchlist");
  };

  const handleWatched = () => {
    onToggleWatched(movie);
    onShowToast(!isW ? "Marked as Watched" : "Marked as Unwatched");
  };

  const currentSeason = movie.seasons?.find((s: Season) => s.number === activeSeason);
  const bgImage = movie.backdrop || movie.poster;
  const displayGenre = movie.genres && movie.genres.length > 0 ? movie.genres[0] : movie.type === 'movie' ? 'MOVIE' : 'TV SHOW';

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={modalOverlay} className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center overflow-hidden">
      <motion.div 
        variants={modalContent} 
        className="bg-[#0A0A0A] w-full max-w-2xl h-[100dvh] sm:h-[90vh] sm:rounded-[2rem] rounded-none overflow-hidden flex flex-col relative shadow-2xl border border-white/5"
      >
        <AnimatePresence>
          {selectedEpisode && <EpisodeDetailModal episode={selectedEpisode} seasonNumber={activeSeason} showTitle={movie.title} onClose={() => setSelectedEpisode(null)} isWatched={watchedEpisodes.includes(`${movie.id}-S${activeSeason}-E${selectedEpisode.number}`)} onToggleWatch={() => toggleEpisode(`${movie.id}-S${activeSeason}-E${selectedEpisode.number}`)} />}
        </AnimatePresence>
        
        <div className="absolute top-0 left-0 right-0 h-[45vh] z-0 pointer-events-none">
           <div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: `url(${bgImage})` }} />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent h-40" />
        </div>
        
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center z-[410] text-white border border-white/5 active:scale-90 transition-transform hover:bg-white/10"><X size={20} /></button>
        
        <div className="flex-1 overflow-y-auto relative z-10 no-scrollbar">
           <div className="pt-[35vh] px-6 pb-32 space-y-8">
             <div className="flex gap-6 items-end">
               <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 bg-gray-900">
                 <img src={movie.poster || FALLBACK_POSTER} className="w-full h-full object-cover" alt={movie.title} />
               </div>
               <div className="flex-1 pb-1">
                  <h2 className="text-3xl font-black mb-2 text-white leading-none tracking-tight drop-shadow-md">{movie.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>{movie.year}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span className="text-gray-200">{displayGenre}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <div className="flex items-center gap-1 text-yellow-500"><Star size={10} fill="currentColor" /> {getCommunityRating(movie.id, movie.rating)}</div>
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-3">
                {[ { icon: Bookmark, label: 'LIST', active: isInW, action: handleWatchlist, fill: true },
                   { icon: CheckCircle2, label: 'SEEN', active: isW, action: handleWatched, fill: false },
                   { icon: Heart, label: 'FAV', active: isFav, action: handleToggleFav, fill: true },
                   { icon: PlayCircle, label: 'TRAILER', active: true, action: () => onPlayTrailer(movie), dark: true, fill: false }
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all active:scale-95 ${btn.dark ? 'bg-white text-black border-transparent shadow-lg' : btn.active ? 'bg-[#6B46C1] text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}>
                    <btn.icon size={18} fill={btn.active && btn.fill !== false ? "currentColor" : "none"} />
                    <span className="text-[7px] font-black mt-1.5 uppercase tracking-widest">{btn.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-sm font-medium leading-relaxed text-gray-300">{movie.description}</p>

              {/* Where to Watch Section */}
              {movie.streamingPlatforms && movie.streamingPlatforms.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <MonitorPlay size={10} /> WHERE TO WATCH
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                    {movie.streamingPlatforms.map((platform: StreamingPlatform, i: number) => (
                      <div 
                        key={i} 
                        className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-gray-900 group relative transition-transform active:scale-95"
                        title={platform.name}
                      >
                        {platform.url ? (
                          <img src={platform.url} alt={platform.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white text-center p-1 bg-gradient-to-br from-gray-700 to-gray-900">
                            {platform.name}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">CAST & CREW</h4>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
                  {movie.cast.map((c: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => onSelectPerson(c.name || c)} 
                      className="flex-shrink-0 flex items-center gap-3 bg-[#1A1A1A] pr-4 p-1.5 rounded-full border border-white/10 active:scale-95 transition-transform cursor-pointer hover:border-white/20"
                    >
                      {c.profile ? (
                        <img src={c.profile} className="w-9 h-9 rounded-full object-cover" alt={c.name} loading="lazy" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50"><UserIcon size={16} /></div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-none">{c.name || c}</span>
                        {c.character && <span className="text-[8px] font-bold text-[#6B46C1] uppercase tracking-wide truncate max-w-[80px]">{c.character}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {movie.type === 'show' && movie.seasons && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">EPISODES</h4>
                    <div className="flex gap-1">
                      {movie.seasons.map((s: Season) => (
                        <button key={s.number} onClick={() => setActiveSeason(s.number)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${activeSeason === s.number ? 'bg-[#6B46C1] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{s.number}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {currentSeason?.episodes.map((ep: Episode) => { 
                      const epId = `${movie.id}-S${activeSeason}-E${ep.number}`; 
                      const isEpWatched = watchedEpisodes.includes(epId); 
                      return (
                        <div key={ep.id} onClick={() => setSelectedEpisode(ep)} className={`flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer active:bg-white/5 transition-colors ${isEpWatched ? 'opacity-50' : ''}`}>
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                            <img src={ep.thumbnail || movie.poster} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{ep.number}. {ep.title}</h5>
                            <p className="text-[9px] text-gray-500 truncate">{ep.runtime || 'N/A'}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); toggleEpisode(epId); }} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isEpWatched ? 'bg-[#6B46C1] text-white' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                            <Check size={16} strokeWidth={isEpWatched ? 3 : 2} className={isEpWatched ? 'opacity-100' : 'opacity-40'} />
                          </button>
                        </div>
                      ); 
                    })}
                  </div>
                </div>
              )}
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export const PersonModal = memo(({ name, onClose, onSelectMovie }: any) => {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.fetchPersonDetails(name).then(d => { setPerson(d); setLoading(false); });
  }, [name]);

  const isLongBio = person?.bio && person.bio.length > 250;

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={modalOverlay} className="fixed inset-0 z-[450] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <motion.div variants={modalContent} className="bg-[#0F0F0F] w-full max-xl max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col relative border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center z-[460] text-white active:scale-90 transition-transform hover:bg-white/20"><X size={20} /></button>
        {loading ? <div className="flex-1 flex items-center justify-center min-h-[300px]"><Loader2 className="animate-spin text-[#6B46C1]" size={32} /></div> : person && (
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-white/10 mb-4 shadow-xl bg-gray-900">
                <img src={person.photo || FALLBACK_POSTER} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{person.name}</h2>
              <p className="text-[#6B46C1] font-bold text-[10px] uppercase tracking-widest mt-1">{person.role}</p>
            </div>
            
            <p className={`text-sm text-gray-400 mb-2 leading-relaxed ${isBioExpanded ? '' : 'line-clamp-4'}`}>
              {person.bio}
            </p>
            {isLongBio && (
              <button 
                onClick={() => setIsBioExpanded(!isBioExpanded)} 
                className="text-[#6B46C1] text-[10px] font-black uppercase tracking-widest mb-8 hover:text-white transition-colors"
              >
                {isBioExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}

            {!isLongBio && <div className="mb-6"></div>}

            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">KNOWN FOR</h4>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-8 px-8">
              {person.knownFor.map((m: any) => (<MovieCard key={m.id} movie={m} onClick={() => { onSelectMovie(m); onClose(); }} />))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});
