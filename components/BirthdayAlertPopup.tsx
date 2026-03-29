
import React from 'react';
import { X, Cake, CalendarClock, ChevronRight } from 'lucide-react';
import { Member, Translation, SystemSettings } from '../types';

interface BirthdayAlertPopupProps {
  members: Member[];
  translation: Translation;
  settings: SystemSettings;
  onClose: () => void;
}

export const BirthdayAlertPopup: React.FC<BirthdayAlertPopupProps> = ({ members, translation, settings, onClose }) => {
  const isLight = settings.theme === 'light';

  if (members.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-500">
      <div 
        className={`absolute inset-0 ${isLight ? 'bg-slate-900/40' : 'bg-black/60'}`} 
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        {/* Header Decorator */}
        <div className="h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 relative">
          <div className="absolute inset-0 opacity-20 overflow-hidden">
             {Array.from({ length: 10 }).map((_, i) => (
               <Cake key={i} size={24} className="absolute text-white animate-pulse" style={{
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 transform: `rotate(${Math.random() * 360}deg)`,
                 animationDelay: `${Math.random() * 2}s`
               }} />
             ))}
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
             <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl border-4 ${isLight ? 'bg-white border-white' : 'bg-slate-900 border-slate-900'}`}>
                <CalendarClock size={32} className="text-pink-500" />
             </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="pt-14 pb-8 px-8 flex flex-col items-center">
          <h3 className={`text-xl font-black text-center mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {translation.upcomingBirthdaysTitle}
          </h3>
          <p className={`text-xs text-center mb-8 px-4 opacity-60 font-medium ${isLight ? 'text-slate-600' : 'text-white'}`}>
            {translation.upcomingBirthdaysDesc}
          </p>

          <div className="w-full space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
            {members.map((m) => {
              const [year, month, day] = m.birthDate.split('T')[0].split('-');
              const today = new Date();
              const bThisYear = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
              const diffTime = bThisYear.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={m.id}
                  className={`flex items-center gap-4 p-4 rounded-[28px] border transition-all hover:scale-[1.02] ${isLight ? 'bg-slate-50 border-slate-100 hover:border-pink-200' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-pink-500/30'}`}
                >
                  <div className="relative">
                    <img src={m.photo} className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-500/20" alt={m.firstName} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white/10">
                       <Cake size={8} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{m.firstName} {m.lastName}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-pink-500">
                      {diffDays === 1 ? translation.tomorrow : translation.inDays.replace('{days}', diffDays.toString())}
                    </p>
                  </div>
                  <ChevronRight size={16} className="opacity-20" />
                </div>
              );
            })}
          </div>

          <button 
            onClick={onClose}
            className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            {translation.understood}
          </button>
        </div>
      </div>
    </div>
  );
};
