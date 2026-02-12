
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Bookmark, Tv, Inbox, LayoutGrid, Clapperboard } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { triggerHaptic } from '../utils';

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
