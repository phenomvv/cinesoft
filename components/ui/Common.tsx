
import React, { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../../utils';

export const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.52 12.29C23.52 11.43 23.45 10.61 23.32 9.82H12V14.45H18.47C18.18 15.99 17.34 17.29 16.08 18.14V21.2H19.95C22.21 19.11 23.52 16.03 23.52 12.29Z" fill="#4285F4"/>
    <path d="M12 24C15.24 24 17.96 22.92 19.95 21.2L16.08 18.14C15 18.86 13.62 19.29 12 19.29C8.87 19.29 6.22 17.17 5.27 14.31H1.27V17.41C3.25 21.34 7.32 24 12 24Z" fill="#34A853"/>
    <path d="M5.27 14.31C5.03 13.57 4.9 12.79 4.9 12C4.9 11.21 5.03 10.43 5.27 9.69V6.59H1.27C0.46 8.21 0 10.05 0 12C0 13.95 0.46 15.79 1.27 17.41L5.27 14.31Z" fill="#FBBC05"/>
    <path d="M12 4.71C13.76 4.71 15.34 5.32 16.59 6.51L19.99 3.11C17.96 1.22 15.24 0 12 0C7.32 0 3.25 2.66 1.27 6.59L5.27 9.69C6.22 6.83 8.87 4.71 12 4.71Z" fill="#EA4335"/>
  </svg>
);

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] bg-[#1A1A1A] border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-xs tracking-wide backdrop-blur-md"
    >
      <div className="bg-[#6B46C1] p-1 rounded-full text-white shadow-lg shadow-purple-900/50">
        <Check size={12} strokeWidth={3} />
      </div>
      {message}
    </motion.div>
  );
};

export const Button = memo(({ children, onClick, className = "", variant = "primary", disabled = false }: any) => {
  const base = "px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-xs transition-transform duration-100 active:scale-95";
  const variants: any = {
    primary: "bg-[#6B46C1]/10 text-[#6B46C1]",
    secondary: "bg-[#2D353E] text-[#F0FFF4]",
    accent: "bg-[#3E2D2D] text-[#FFF5F5]",
    dark: "bg-black/80 text-white border border-white/10",
    pro: "bg-gradient-to-r from-[#6B46C1] to-[#805AD5] text-white shadow-lg shadow-purple-500/20"
  };

  const handleClick = (e: React.MouseEvent) => {
    triggerHaptic('light');
    if (onClick) onClick(e);
  };

  return (
    <button 
      onClick={handleClick} 
      className={`${base} ${variants[variant]} ${className}`} 
      disabled={disabled}
    >
      {children}
    </button>
  );
});

export const SkeletonCard = memo(() => (
  <div className="flex-shrink-0 w-32 sm:w-36 animate-pulse">
    <div className="aspect-[2/3] rounded-[1.5rem] bg-white/5 mb-2 border border-white/5" />
    <div className="h-3 bg-white/5 rounded-full w-3/4 mb-1" />
  </div>
));
