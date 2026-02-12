import React, { useState, useEffect, memo, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants, useMotionValue, useTransform, animate, useScroll } from 'framer-motion';
import { 
  X, Star, CheckCircle2, Heart, PlayCircle, ChevronDown, Check, BarChart3, Sparkles, Loader2, Bookmark, User as UserIcon, MonitorPlay, Bell, BellRing, Clock
} from 'lucide-react';
import { Movie, Episode, Season, StreamingPlatform } from '../types';
import * as GeminiAPI from '../services/gemini';
import * as TmdbAPI from '../services/tmdb';
import { FALLBACK_POSTER, getCommunityRating, triggerHaptic } from '../utils';
import { StarRating } from '../components/ui/StarRating';
import { MovieCard } from '../components/movie/MovieCard';

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        <button 
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }} 
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
        >
          <ChevronDown size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B46C1] mb-1">S{seasonNumber} • E{episode.number}</h3>
            <h2 className="text-2xl font-black text-white leading-tight">{episode.title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              triggerHaptic(isWatched ? 'light' : 'medium');
              onToggleWatch();
            }} 
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isWatched ? 'bg-[#6B46C1] text-white' : 'bg-white/10 text-white border border-white/10'}`}
          >
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

export const MovieDetailModal = memo(({ movie: initialMovie, onClose, user, setUser, onToggleWatchlist, onToggleWatched, onToggleFavorite, onToggleNotification, onRateMovie, onSelectPerson, onSelectMovie, onPlayTrailer, onShowToast }: any) => {
  const [movie, setMovie] = useState<Movie | null>(initialMovie);
  const [activeSeason, setActiveSeason] = useState(1);
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>(user.watchedEpisodes || []);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const episodesScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const bgBlur = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(40px)"]);
  
  const dragY = useMotionValue(0);
  const bgScale = useTransform(dragY, [0, 600], [1.3, 1.75]);
  const contentY = useTransform(dragY, [0, 600], [0, 200]);
  
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      dragStartY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentY = e.touches[0].clientY;
    const rawDelta = currentY - dragStartY.current;

    if (rawDelta > 0 && scrollRef.current?.scrollTop! <= 0) {
      const damped = Math.pow(rawDelta, 0.85); 
      dragY.set(damped);
    } else if (rawDelta < 0 && dragY.get() > 0) {
       dragY.set(Math.max(0, dragY.get() + rawDelta));
       dragStartY.current = currentY;
    } else {
      dragY.set(0);
      if (rawDelta < 0) isDragging.current = false;
    }
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    dragStartY.current = 0;
    animate(dragY, 0, { type: "spring", stiffness: 200, damping: 20, mass: 0.5 });
  };

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
  const isNotified = user.notificationIds?.includes(movie.id);
  const userRating = user.userRatings?.[movie.id] || 0;

  const isUnreleased = movie.releaseDate ? new Date(movie.releaseDate) > new Date() : false;

  const handleToggleFav = () => {
    triggerHaptic('light');
    onToggleFavorite(movie);
    onShowToast(!isFav ? "Added to Favorites" : "Removed from Favorites");
  };

  const toggleEpisode = (epId: string, index: number) => {
    const isNowWatched = !watchedEpisodes.includes(epId);
    triggerHaptic(isNowWatched ? 'medium' : 'light');
    const updated = isNowWatched ? [...watchedEpisodes, epId] : watchedEpisodes.filter(id => id !== epId);
    setWatchedEpisodes(updated);
    setUser({ ...user, watchedEpisodes: updated });

    if (isNowWatched && episodesScrollRef.current) {
        const container = episodesScrollRef.current;
        const children = container.children;
        const nextIndex = index + 1;
        
        if (nextIndex < children.length) {
            const currentElement = children[index] as HTMLElement;
            const nextElement = children[nextIndex] as HTMLElement;
            const visualLeft = currentElement.offsetLeft - container.scrollLeft;
            setTimeout(() => {
                const targetX = nextElement.offsetLeft - visualLeft;
                container.scrollTo({ left: targetX, behavior: 'smooth' });
            }, 40);
        }
    }
  };

  const handleWatchlist = () => {
    triggerHaptic('light');
    onToggleWatchlist(movie);
    onShowToast(!isInW ? "Added to Watchlist" : "Removed from Watchlist");
  };

  const handleWatched = () => {
    triggerHaptic('medium');
    onToggleWatched(movie);
    onShowToast(!isW ? "Marked as Watched" : "Marked as Unwatched");
  };

  const handleNotify = () => {
    triggerHaptic('light');
    onToggleNotification(movie);
    onShowToast(!isNotified ? "We'll notify you on release!" : "Notifications turned off");
  };

  const handleRate = (rating: number) => {
    onRateMovie(movie.id, rating);
    onShowToast(`Rated ${rating} stars!`);
  };

  const seasonProgress = useMemo(() => {
    if (movie.type !== 'show' || !movie.seasons) return {};
    const stats: Record<number, number> = {};
    movie.seasons.forEach(s => {
      const total = s.episodes.length;
      if (total === 0) {
        stats[s.number] = 0;
        return;
      }
      const watchedCount = watchedEpisodes.filter(id => id.startsWith(`${movie.id}-S${s.number}-E`)).length;
      stats[s.number] = (watchedCount / total) * 100;
    });
    return stats;
  }, [movie.id, movie.seasons, watchedEpisodes]);

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
          {selectedEpisode && <EpisodeDetailModal episode={selectedEpisode} seasonNumber={activeSeason} showTitle={movie.title} onClose={() => setSelectedEpisode(null)} isWatched={watchedEpisodes.includes(`${movie.id}-S${activeSeason}-E${selectedEpisode.number}`)} onToggleWatch={() => toggleEpisode(`${movie.id}-S${activeSeason}-E${selectedEpisode.number}`, currentSeason?.episodes.findIndex(e => e.id === selectedEpisode.id) ?? 0)} />}
        </AnimatePresence>
        
        <motion.div 
            style={{ scale: bgScale, originY: 0, filter: bgBlur }}
            className="absolute top-0 left-0 right-0 h-[50vh] z-0 pointer-events-none will-change-transform"
        >
           <div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: `url(${bgImage})` }} />
           <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
           <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
        </motion.div>
        
        <button 
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }} 
          className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center z-[410] text-white border border-white/5 active:scale-90 transition-transform hover:bg-white/10"
        >
          <X size={20} />
        </button>
        
        <div 
            ref={scrollRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 no-scrollbar overscroll-y-contain"
        >
           <motion.div 
             style={{ y: contentY }} 
             className="pt-[35vh] px-6 pb-16 space-y-8 will-change-transform"
             layout
           >
             <motion.div layout className="flex gap-6 items-end">
               <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 bg-gray-900">
                 <img src={movie.poster || FALLBACK_POSTER} className="w-full h-full object-cover" alt={movie.title} />
               </div>
               <div className="flex-1 pb-1">
                  {movie.logo ? (
                    <img 
                      src={movie.logo} 
                      alt={movie.title} 
                      className="max-w-[200px] h-auto max-h-24 object-contain mb-2 drop-shadow-2xl" 
                    />
                  ) : (
                    <h2 className="text-3xl font-black mb-2 text-white leading-none tracking-tight drop-shadow-md">{movie.title}</h2>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>{movie.year}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span className="text-gray-200">{displayGenre}</span>
                    {movie.runtime && (
                      <>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="flex items-center gap-1.5"><Clock size={10} className="text-[#6B46C1]" /> {movie.runtime}</span>
                      </>
                    )}
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    {!isUnreleased && (
                        <div className="flex items-center gap-1 text-yellow-500"><Star size={10} fill="currentColor" /> {getCommunityRating(movie.id, movie.rating)}</div>
                    )}
                    {isUnreleased && (
                        <div className="flex items-center gap-1 text-orange-500 font-black uppercase tracking-widest"><Sparkles size={10} fill="currentColor" /> Coming Soon</div>
                    )}
                  </div>
               </div>
             </motion.div>

             <motion.div layout className="grid grid-cols-4 gap-3">
                {isUnreleased ? (
                    <>
                      <button 
                        onClick={handleNotify} 
                        className={`col-span-3 flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all active:scale-95 backdrop-blur-xl ${
                          isNotified 
                            ? 'bg-orange-500/90 text-white border-transparent shadow-lg shadow-orange-500/20' 
                            : 'bg-black/40 text-gray-300 border-white/10 hover:bg-black/60 shadow-md'
                        }`}
                      >
                        {isNotified ? <BellRing size={18} /> : <Bell size={18} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{isNotified ? 'NOTIFYING' : 'GET NOTIFIED'}</span>
                      </button>
                      <button 
                        onClick={() => {
                          triggerHaptic('light');
                          onPlayTrailer(movie);
                        }} 
                        className="flex flex-col items-center justify-center py-3 rounded-2xl bg-white/90 text-black border-transparent shadow-lg active:scale-95 transition-all"
                      >
                        <PlayCircle size={18} />
                        <span className="text-[7px] font-black mt-1.5 uppercase tracking-widest">TRAILER</span>
                      </button>
                    </>
                ) : (
                    [ { icon: Bookmark, label: 'LIST', active: isInW, action: handleWatchlist, fill: true },
                      { icon: CheckCircle2, label: 'SEEN', active: isW, action: handleWatched, fill: false },
                      { icon: Heart, label: 'FAV', active: isFav, action: handleToggleFav, fill: true },
                      { icon: PlayCircle, label: 'TRAILER', active: true, action: () => { triggerHaptic('light'); onPlayTrailer(movie); }, dark: true, fill: false }
                    ].map((btn, i) => (
                      <button key={i} onClick={btn.action} className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all active:scale-95 backdrop-blur-xl ${
                        btn.dark 
                          ? 'bg-white/90 text-black border-transparent shadow-lg hover:bg-white' 
                          : btn.active 
                            ? 'bg-[#6B46C1]/90 text-white border-transparent shadow-lg shadow-purple-500/20' 
                            : 'bg-black/40 text-gray-300 border-white/10 hover:bg-black/60 shadow-md'
                      }`}>
                        <btn.icon size={18} fill={btn.active && btn.fill !== false ? "currentColor" : "none"} />
                        <span className="text-[7px] font-black mt-1.5 uppercase tracking-widest">{btn.label}</span>
                      </button>
                    ))
                )}
              </motion.div>

              <AnimatePresence mode="popLayout">
                {isW && !isUnreleased && (
                  <StarRating key="rating" rating={userRating} onRate={handleRate} />
                )}
              </AnimatePresence>

              <motion.div layout className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6B46C1] shadow-[0_0_8px_rgba(107,70,193,0.6)]" />
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">STORYLINE</h4>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-300">
                  {movie.description}
                </p>
              </motion.div>

              {movie.streamingPlatforms && movie.streamingPlatforms.length > 0 && !isUnreleased && (
                <motion.div layout className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <MonitorPlay size={10} /> WHERE TO WATCH
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                    {movie.streamingPlatforms.map((platform: StreamingPlatform, i: number) => (
                      <div 
                        key={i} 
                        onClick={() => triggerHaptic('light')}
                        className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-gray-900 group relative transition-transform active:scale-95 cursor-pointer"
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
                </motion.div>
              )}

              <motion.div layout className="space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">CAST & CREW</h4>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
                  {movie.cast.map((c: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        triggerHaptic('light');
                        onSelectPerson(c.name || c);
                      }} 
                      className="flex-shrink-0 w-24 flex flex-col gap-3 group cursor-pointer active:scale-95 transition-transform"
                    >
                      <div className="relative w-full aspect-[3/4.2] rounded-2xl border-2 border-white/10 overflow-hidden shadow-xl group-hover:border-[#6B46C1] transition-all bg-white/[0.03]">
                          {c.profile ? (
                            <img src={c.profile} className="w-full h-full object-cover" alt={c.name} loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon size={24} className="text-white/10" />
                            </div>
                          )}
                      </div>
                      <div className="flex flex-col items-center text-center space-y-0.5 px-0.5">
                        <span className="text-[10px] font-black text-white leading-tight">{c.name || c}</span>
                        {c.character && (
                          <span className="text-[8px] font-bold text-[#6B46C1] uppercase tracking-tight opacity-100">
                            {c.character}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {movie.type === 'show' && movie.seasons && (
                <motion.div layout className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">EPISODES</h4>
                    <div className="flex gap-3">
                      {movie.seasons.map((s: Season) => {
                        const progress = seasonProgress[s.number] || 0;
                        const isComplete = progress === 100;
                        return (
                          <div key={s.number} className="flex flex-col items-center gap-1.5">
                            <button 
                              onClick={() => {
                                triggerHaptic('light');
                                setActiveSeason(s.number);
                              }} 
                              className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${
                                activeSeason === s.number 
                                  ? 'bg-[#6B46C1] text-white border-transparent shadow-lg shadow-purple-900/30' 
                                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                              }`}
                            >
                              {s.number}
                            </button>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                    className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-[#6B46C1]'}`} 
                                />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div 
                    ref={episodesScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar scroll-smooth"
                  >
                    {currentSeason?.episodes.map((ep: Episode, index: number) => { 
                      const epId = `${movie.id}-S${activeSeason}-E${ep.number}`; 
                      const isEpWatched = watchedEpisodes.includes(epId); 
                      return (
                        <div 
                          key={ep.id} 
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedEpisode(ep);
                          }} 
                          className={`flex-shrink-0 w-48 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-black/60 transition-all shadow-md group ${isEpWatched ? 'opacity-60' : ''}`}
                        >
                          <div className="relative aspect-video w-full bg-gray-800">
                             <img src={ep.thumbnail || movie.poster} className="w-full h-full object-cover" loading="lazy" />
                             <div className="absolute top-2 right-2 z-20">
                               <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    toggleEpisode(epId, index); 
                                  }} 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg ${isEpWatched ? 'bg-[#6B46C1] text-white' : 'bg-black/40 text-white/40 border border-white/10 hover:border-white/30'}`}
                                >
                                  <Check size={14} strokeWidth={isEpWatched ? 3 : 2} />
                                </button>
                             </div>
                             <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-black text-white/80 border border-white/5">
                                EP {ep.number}
                             </div>
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <PlayCircle size={24} className="text-white/80" />
                             </div>
                          </div>
                          <div className="p-3">
                            <h5 className="text-[10px] font-bold text-white truncate leading-tight">{ep.title}</h5>
                            <p className="text-[8px] text-gray-500 truncate mt-1 uppercase tracking-widest font-black">{ep.runtime || 'N/A'}</p>
                          </div>
                        </div>
                      ); 
                    })}
                  </div>
                </motion.div>
              )}
           </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
});