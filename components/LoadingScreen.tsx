
import React, { useEffect, useState } from 'react';
import { Translation, User, SystemSettings } from '../types';
import { ChurchLogo } from './ChurchLogo';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  user: User;
  settings: SystemSettings;
  translation: Translation;
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ user, settings, translation, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const isLight = settings.theme === 'light';

  const statusMessages = [
    translation.startingSession,
    translation.identityVerification,
    translation.syncing,
    translation.accessGranted
  ];

  useEffect(() => {
    const duration = 3500;
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    const statusTimer = setInterval(() => {
      setStatusIndex(prev => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, duration / statusMessages.length);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 ${isLight ? 'bg-slate-50' : 'bg-black'}`}>
      {/* Background Ambient Light */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none ${isLight ? 'bg-blue-400' : 'bg-blue-600'}`} />
      
      <div className="relative flex flex-col items-center">
        
        {/* Animated Rings */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-8">
          
          {/* Outer Pulsing Aura */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-20" />
          
          {/* Rotating Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeDasharray="100%"
              strokeDashoffset={`${100 - progress}%`}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* User Photo Container */}
          <div className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 border backdrop-blur-xl shadow-2xl animate-in zoom-in-50 duration-700 ${isLight ? 'bg-white/80 border-white' : 'bg-white/10 border-white/20'}`}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500/30">
               <img 
                 src={user.photo} 
                 alt={user.firstName} 
                 className="w-full h-full object-cover animate-in fade-in duration-1000"
               />
            </div>
            
            {/* Logo Overlay Badge - FIXED: Now uses settings.systemLogo if available */}
            <div className="absolute -bottom-1 -right-1 w-12 h-12 sm:w-14 sm:h-14 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
               {settings.systemLogo ? (
                 <div className="w-full h-full rounded-2xl bg-white p-1 shadow-lg flex items-center justify-center overflow-hidden border border-slate-100">
                   <img src={settings.systemLogo} className="w-full h-full object-contain" alt="System Logo" />
                 </div>
               ) : (
                 <ChurchLogo className="w-full h-full shadow-lg" />
               )}
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-3 px-6 z-10">
          <div className="flex flex-col">
            <span className={`${isLight ? 'text-slate-400' : 'text-white/40'} text-[10px] font-black uppercase tracking-[0.3em] mb-1 animate-pulse`}>
              {translation.startingSession}
            </span>
            <h2 className={`${isLight ? 'text-slate-900' : 'text-white'} text-2xl sm:text-3xl font-black tracking-tight`}>
              {user.firstName} {user.lastName}
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 py-2 px-6 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Loader2 className="animate-spin text-blue-500" size={16} />
            <p className={`text-xs font-bold tracking-wide ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
              {statusMessages[statusIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-30">
         <div className="flex items-center gap-2">
           <ShieldCheck size={14} className="text-blue-500" />
           <p className={`text-[8px] font-black uppercase tracking-[0.4em] ${isLight ? 'text-slate-900' : 'text-white'}`}>
             FOI PARFAITE BIOMETRIC CLOUD
           </p>
         </div>
         <div className={`w-32 h-0.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
         </div>
      </div>
    </div>
  );
};
