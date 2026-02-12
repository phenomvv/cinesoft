
import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, Settings, Trophy, Clapperboard, Popcorn, PlayCircle, HelpCircle
} from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { triggerHaptic } from '../utils';

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

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
    <div className="pt-28 px-6 pb-24 max-w-xl mx-auto w-full min-h-screen bg-[#050505] overflow-x-hidden">
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
            className="mb-8"
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
