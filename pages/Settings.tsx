
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, ChevronLeft, LogOut, Baby, Globe, ShieldCheck, Mail
} from 'lucide-react';
import { triggerHaptic } from '../utils';
import { GoogleLogo } from '../components/ui/Common';

export const SettingsPage = memo(({ user, setUser }: any) => {
  const navigate = useNavigate();
  const languages = ["English", "Spanish", "French", "German", "Japanese"];

  const handleSignOut = () => {
    triggerHaptic('heavy');
    localStorage.removeItem('cinesoft_user');
    window.location.reload();
  };

  const toggleKidsMode = () => {
    triggerHaptic('medium');
    setUser({ ...user, isKidsMode: !user.isKidsMode });
  };

  const handleLanguageChange = (lang: string) => {
    triggerHaptic('light');
    setUser({ ...user, language: lang });
  };

  const handleLogin = (type: 'google' | 'email') => {
    triggerHaptic('medium');
    const mockUser = {
      ...user,
      name: type === 'google' ? 'Alex Chen' : 'Alex Chen',
      email: type === 'google' ? 'alex.c@gmail.com' : 'alex@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    };
    setUser(mockUser);
    localStorage.setItem('cinesoft_user', JSON.stringify(mockUser));
  };

  const isGuest = user.email.includes('guest') || !user.email;

  return (
    <div className="pt-24 px-6 pb-32 max-w-xl mx-auto w-full min-h-screen bg-[#050505] overflow-x-hidden">
        {/* Back Button */}
        <button 
            onClick={() => { triggerHaptic('light'); navigate(-1); }}
            className="flex items-center gap-2 mb-8 text-gray-500 hover:text-white transition-colors p-1"
        >
            <ChevronLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <h2 className="text-3xl font-black text-white mb-10 tracking-tight uppercase">Settings</h2>

        <div className="space-y-6">
            {/* Account Section */}
            <section>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">ACCOUNT</h3>
                
                {isGuest ? (
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl p-6">
                    <div className="mb-6">
                      <h4 className="text-white font-black text-lg mb-1">Sync your library</h4>
                      <p className="text-gray-500 text-xs">Sign in to save your watchlist across devices.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleLogin('google')}
                        className="w-full py-3 bg-white rounded-xl flex items-center justify-center gap-2 text-black font-black text-xs active:scale-95 transition-transform"
                      >
                        <GoogleLogo />
                        Continue with Google
                      </button>
                      <button 
                        onClick={() => handleLogin('email')}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white font-black text-xs active:scale-95 transition-transform hover:bg-white/10"
                      >
                        <Mail size={16} />
                        Sign in with Email
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
                      <div className="p-6 flex items-center gap-4 border-b border-white/5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#4C1D95] flex items-center justify-center text-white border border-white/10 overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <UserCircle size={28} />
                              )}
                          </div>
                          <div>
                              <p className="text-white font-black text-sm">{user.name}</p>
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{user.email}</p>
                          </div>
                      </div>
                      <button 
                          onClick={handleSignOut}
                          className="w-full p-5 flex items-center gap-4 text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                          <div className="p-2 bg-red-500/10 rounded-xl"><LogOut size={18} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out Account</span>
                      </button>
                  </div>
                )}
            </section>

            {/* Preferences Section */}
            <section>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">PREFERENCES</h3>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl divide-y divide-white/5">
                    {/* Kids Mode Toggle */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#6B46C1]/10 text-[#6B46C1] rounded-xl"><Baby size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Kids Mode</span>
                                <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Filtered content</span>
                            </div>
                        </div>
                        <button 
                            onClick={toggleKidsMode} 
                            className={`w-12 h-7 rounded-full transition-all relative shadow-inner ${user.isKidsMode ? 'bg-[#6B46C1]' : 'bg-[#333]'}`}
                        >
                            <motion.div animate={{ x: user.isKidsMode ? 22 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md" />
                        </button>
                    </div>

                    {/* Language Selector */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><Globe size={18} /></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Language</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {languages.map(lang => (
                                <button 
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        user.language === lang 
                                            ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-900/20' 
                                            : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* System Section */}
            <section>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">SYSTEM</h3>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-500/10 text-gray-500 rounded-xl"><ShieldCheck size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Security</span>
                                <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Encrypted local storage</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">CineSoft v1.1.0 — Build 2025.04</p>
                </div>
            </section>
        </div>
    </div>
  );
});
