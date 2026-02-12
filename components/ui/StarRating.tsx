
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { triggerHaptic } from '../../utils';

export const StarRating = memo(({ rating, onRate }: { rating: number, onRate: (n: number) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="overflow-hidden w-full"
    >
      <div className="flex flex-col items-center justify-center py-2 px-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl mb-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                triggerHaptic('light');
                onRate(star);
              }}
              className="relative p-0.5"
            >
              <Star 
                size={22} 
                fill={star <= rating ? "#FACC15" : "none"} 
                className={`${star <= rating ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-gray-600/30"} transition-colors duration-300`}
                strokeWidth={star <= rating ? 0 : 2}
              />
            </motion.button>
          ))}
        </div>
        <p className={`text-[8px] font-black uppercase tracking-[0.3em] mt-1 transition-colors ${rating > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
          {rating > 0 ? `SCORE: ${rating}/5` : "HOW WAS IT?"}
        </p>
      </div>
    </motion.div>
  );
});
