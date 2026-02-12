
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { triggerHaptic } from '../utils';

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
      <button 
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }} 
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white z-[1010] active:scale-90 transition-transform hover:bg-white/20"
      >
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
