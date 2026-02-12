
import React, { useState, useEffect, memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Person } from '../types';
import * as TmdbAPI from '../services/tmdb';
import * as GeminiAPI from '../services/gemini';
import { MovieCard } from '../components/movie/MovieCard';
import { triggerHaptic, FALLBACK_POSTER } from '../utils';

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
      <motion.div variants={modalContent} className="bg-[#0F0F0F] w-full max-w-xl max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col relative border border-white/10 shadow-2xl">
        <button 
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }} 
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center z-[460] text-white active:scale-90 transition-transform hover:bg-white/20"
        >
          <X size={20} />
        </button>
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
                onClick={() => {
                  triggerHaptic('light');
                  setIsBioExpanded(!isBioExpanded);
                }} 
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
