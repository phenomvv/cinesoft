
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Movie, User } from './types';
import * as GeminiAPI from './geminiService';
import * as TmdbAPI from './tmdbService';
import { GlobalHeader, BottomNav, Toast } from './SharedUI';

const API = TmdbAPI.hasApiKey() ? TmdbAPI : GeminiAPI;

const DEFAULT_USER: User = {
  name: 'CineGuest',
  email: 'guest@cinesoft.app',
  language: 'en',
  isPremium: false,
  isKidsMode: false,
  traktConnected: false,
  traktUsername: null,
  watchlist: [],
  favorites: [],
  watchedHistory: [],
  watched: [],
  watchedEpisodes: [],
  userRatings: {},
  favoriteMovieIds: []
};

const HomePage = lazy(() => import('./Pages').then(m => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('./Pages').then(m => ({ default: m.ExplorePage })));
const LibraryPage = lazy(() => import('./Pages').then(m => ({ default: m.LibraryPage })));
const ProfilePage = lazy(() => import('./Pages').then(m => ({ default: m.ProfilePage })));
const MovieDetailModal = lazy(() => import('./Modals').then(m => ({ default: m.MovieDetailModal })));
const PersonModal = lazy(() => import('./Modals').then(m => ({ default: m.PersonModal })));
const VideoModal = lazy(() => import('./Modals').then(m => ({ default: m.VideoModal })));

const App = () => {
  const [user, setUser] = useState<User>(() => { 
    try {
      const saved = localStorage.getItem('cinesoft_user'); 
      return saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER; 
    } catch { return DEFAULT_USER; }
  });
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingShows, setTrendingShows] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const isModalOpen = !!(selectedMovie || selectedPerson || activeTrailerUrl);

  const showToast = (message: string) => setToast(message);

  const handlePlayTrailer = async (movie: Movie) => {
    if (movie.trailerUrl) {
      setActiveTrailerUrl(movie.trailerUrl);
      return;
    }
    
    // If no trailer URL, fetch full details to get it
    try {
      const details = await API.fetchMovieDetails(movie.id, movie.type);
      if (details?.trailerUrl) {
        setActiveTrailerUrl(details.trailerUrl);
      } else {
        showToast("Trailer not available for this title");
      }
    } catch (err) {
      showToast("Error loading trailer");
    }
  };
  
  useEffect(() => { 
    localStorage.setItem('cinesoft_user', JSON.stringify(user)); 
  }, [user]);
  
  useEffect(() => { 
    let mounted = true;
    const loadHomeData = async () => { 
      setLoading(true); 
      try { 
        const [m, s, r] = await Promise.all([
          API.fetchTrendingMovies(user.isKidsMode), 
          API.fetchTrendingShows(user.isKidsMode), 
          API.fetchRecommendations(user.watchlist.map(m => m.title), user.isKidsMode)
        ]); 
        if (mounted) {
          setTrendingMovies(m || []); 
          setTrendingShows(s || []); 
          setRecommendations(r || []); 
        }
      } catch (err) {
        console.error("Data load failed", err);
      } finally { 
        if (mounted) setLoading(false); 
      } 
    }; 
    loadHomeData(); 
    return () => { mounted = false; };
  }, [user.isKidsMode]);

  const onToggleWatchlist = (movie: Movie) => setUser(prev => { 
    const exists = prev.watchlist.find(m => m.id === movie.id); 
    return { ...prev, watchlist: exists ? prev.watchlist.filter(m => m.id !== movie.id) : [...prev.watchlist, movie] }; 
  });
  
  const onToggleWatched = (movie: Movie) => setUser(prev => { 
    const exists = prev.watched.includes(movie.id); 
    const updatedHistory = exists 
      ? prev.watchedHistory.filter(m => m.id !== movie.id) 
      : [...prev.watchedHistory, movie];
    return { 
      ...prev, 
      watched: exists ? prev.watched.filter(id => id !== movie.id) : [...prev.watched, movie.id],
      watchedHistory: updatedHistory
    }; 
  });

  const onToggleFavorite = (movie: Movie) => setUser(prev => {
    const exists = prev.favoriteMovieIds.includes(movie.id);
    const updatedIds = exists 
      ? prev.favoriteMovieIds.filter(id => id !== movie.id) 
      : [...prev.favoriteMovieIds, movie.id];
    const updatedList = exists 
      ? prev.favorites.filter(m => m.id !== movie.id) 
      : [...prev.favorites, movie];
    return { ...prev, favoriteMovieIds: updatedIds, favorites: updatedList };
  });

  return (
    <div className="min-h-screen font-sans bg-[#050505] text-[#F5F5F5]">
      <HashRouter>
        <motion.div 
          animate={{ scale: isModalOpen ? 0.96 : 1, opacity: isModalOpen ? 0.5 : 1, filter: isModalOpen ? 'blur(2px)' : 'blur(0px)' }} 
          transition={{ duration: 0.4, ease: "circOut" }}
          className="origin-top"
        >
          <GlobalHeader user={user} />
          <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#6B46C1]" /></div>}>
            <Routes>
              <Route path="/" element={<HomePage trendingM={trendingMovies} trendingS={trendingShows} recommendations={recommendations} loading={loading} user={user} onSelectMovie={setSelectedMovie} onPlayTrailer={handlePlayTrailer} />} />
              <Route path="/search" element={<ExplorePage onSelectMovie={setSelectedMovie} user={user} />} />
              <Route path="/library" element={<LibraryPage user={user} onSelectMovie={setSelectedMovie} />} />
              <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
            </Routes>
          </Suspense>
        </motion.div>
        
        <BottomNav />
        
        <AnimatePresence>
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        <Suspense fallback={null}>
          <AnimatePresence>
            {selectedMovie && (
              <MovieDetailModal 
                movie={selectedMovie} 
                onClose={() => setSelectedMovie(null)} 
                user={user} 
                setUser={setUser} 
                onToggleWatchlist={onToggleWatchlist} 
                onToggleWatched={onToggleWatched} 
                onToggleFavorite={onToggleFavorite}
                onSelectPerson={setSelectedPerson} 
                onPlayTrailer={handlePlayTrailer}
                onShowToast={showToast} 
              />
            )}
            {selectedPerson && (
              <PersonModal 
                name={selectedPerson} 
                onClose={() => setSelectedPerson(null)} 
                onSelectMovie={setSelectedMovie} 
                user={user} 
              />
            )}
            {activeTrailerUrl && (
              <VideoModal 
                url={activeTrailerUrl} 
                onClose={() => setActiveTrailerUrl(null)} 
              />
            )}
          </AnimatePresence>
        </Suspense>
      </HashRouter>
    </div>
  );
};

export default App;
