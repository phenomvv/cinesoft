
import React from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, Mail } from 'lucide-react';
import { GoogleLogo } from '../components/ui/Common';

export const LandingPage = ({ onLogin, onGuest }: { onLogin: (type: 'google' | 'email') => void, onGuest: () => void }) => {
  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-end pb-12">
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </motion.div>

      <div className="relative z-10 w-full max-w-md px-8 flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-[#6B46C1] rounded-2xl shadow-[0_0_30px_rgba(107,70,193,0.4)]">
              <Clapperboard size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">CineSoft</h1>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Cinema, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B46C1] to-[#9F7AEA]">Curated.</span>
          </h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            Track your watchlist, discover hidden gems with AI, and experience movies like never before.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-3 w-full"
        >
          <button 
            onClick={() => onLogin('google')}
            className="w-full py-4 bg-white rounded-2xl flex items-center justify-center gap-3 text-black font-black text-sm active:scale-95 transition-transform hover:bg-gray-100 shadow-xl"
          >
            <GoogleLogo />
            Continue with Google
          </button>
          
          <button 
            onClick={() => onLogin('email')}
            className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm active:scale-95 transition-transform hover:bg-white/20"
          >
            <Mail size={18} />
            Sign in with Email
          </button>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onGuest}
          className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Continue as Guest
        </motion.button>
      </div>
    </div>
  );
};
