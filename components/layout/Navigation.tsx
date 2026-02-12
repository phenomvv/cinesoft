
import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clapperboard, Home, Search, Library, User as UserIcon } from 'lucide-react';
import { triggerHaptic } from '../../utils';
import { User } from '../../types';

export const GlobalHeader = memo(({ user }: { user: User }) => {
  const navigate = useNavigate();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[150] px-6 flex items-center bg-transparent"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(5rem + env(safe-area-inset-top))',
        pointerEvents: 'none'
      }}
    >
       <div 
         className="flex items-center gap-2 cursor-pointer pointer-events-auto" 
         onClick={() => {
           triggerHaptic('light');
           navigate('/');
         }}
       >
          <div className="p-2 bg-[#6B46C1] rounded-lg shadow-lg shadow-purple-900/30">
            <Clapperboard size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none text-white drop-shadow-md">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B46C1] to-[#9F7AEA]">Soft</span>
            </h1>
          </div>
        </div>
    </header>
  );
});

export const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', path: '/', icon: Home, label: 'HOME' },
    { id: 'search', path: '/search', icon: Search, label: 'EXPLORE' },
    { id: 'library', path: '/library', icon: Library, label: 'LIBRARY' },
    { id: 'profile', path: '/profile', icon: UserIcon, label: 'PROFILE' }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[200] px-6 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
    >
      <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-full flex items-center justify-between p-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/10 pointer-events-auto max-w-[320px] w-full">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button 
              key={tab.id} 
              onClick={() => {
                triggerHaptic('light');
                navigate(tab.path);
              }} 
              className={`flex-1 relative flex flex-col items-center gap-0.5 py-3 rounded-full transition-all duration-300 outline-none ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {active && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-[#6B46C1] rounded-full z-0 shadow-lg shadow-purple-900/30"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5 transform transition-transform active:scale-90">
                <tab.icon size={18} strokeWidth={active ? 2.5 : 2} />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
