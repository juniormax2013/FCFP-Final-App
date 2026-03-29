
import React, { useRef, useEffect, useState } from 'react';
import { Fingerprint, UserPlus, ShieldCheck, Globe, ChevronRight, Sun, Moon } from 'lucide-react';
import { PinDisplay } from './PinDisplay';
import { Keypad } from './Keypad';
import { ChurchLogo } from './ChurchLogo';
import { SystemSettings, Translation, Language } from '../types';
import { ForgotPinModal } from './ForgotPinModal';

interface LoginScreenProps {
  settings: SystemSettings;
  translation: Translation;
  pin: string;
  isError: boolean;
  isLight: boolean;
  onPinChange: (pin: string) => void;
  onNumberClick: (n: string) => void;
  onDelete: () => void;
  onRegister: () => void;
  onConfirm: () => void;
  onLanguageSelect: (lang: Language) => void;
  onToggleTheme: () => void;
  onForgotPin: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings, translation, pin, isError, isLight, onPinChange, onNumberClick, onDelete, onRegister, onConfirm, onLanguageSelect, onToggleTheme, onForgotPin
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    const focusInput = () => {
      if (!showForgotModal) {
        inputRef.current?.focus();
      }
    };
    
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, [showForgotModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    onPinChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 4) {
      onConfirm();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row animate-in fade-in duration-700 overflow-hidden">
      
      {!showForgotModal && (
        <input 
          ref={inputRef}
          type="tel"
          inputMode="none"
          pattern="[0-9]*"
          value={pin}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 pointer-events-none"
          autoFocus
          autoComplete="one-time-code"
        />
      )}

      {/* Panel Izquierdo - Branding */}
      <div className="relative w-full md:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400 flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden">
        <div className="absolute top-10 left-10 grid grid-cols-6 gap-2 opacity-20">
          {Array.from({ length: 36 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />)}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
          <div className="mb-8 relative transform hover:scale-105 transition-transform duration-500">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white flex items-center justify-center shadow-2xl p-2 overflow-hidden">
              {settings.systemLogo ? (
                <img src={settings.systemLogo} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <ChurchLogo className="w-full h-full" />
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white text-blue-600 p-3 rounded-full shadow-xl">
               <ShieldCheck size={24} />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] mb-8">
            {settings.systemName}
          </h2>

          <div className="flex items-center gap-4 w-full mb-4">
            <div className="h-px bg-white/20 flex-1" />
            <span className="text-white text-xl font-bold uppercase tracking-widest">{translation.welcome}</span>
            <div className="h-px bg-white/20 flex-1" />
          </div>

          <p className="text-white/80 text-sm sm:text-lg font-medium leading-relaxed px-4">
            {translation.pinDisplaySub}
          </p>
        </div>
      </div>

      {/* Panel Derecho - Interacción */}
      <div 
        className={`relative w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 cursor-pointer transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-[#0a0a0a]'}`}
        onClick={() => !showForgotModal && inputRef.current?.focus()}
      >
        {/* Controles Superiores: Tema */}
        <div className="absolute top-6 right-6">
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleTheme(); }}
             className={`p-3 rounded-full transition-all active:scale-90 shadow-sm border ${isLight ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-white/5 border-white/10 text-white'}`}
           >
             {isLight ? <Moon size={20} /> : <Sun size={20} />}
           </button>
        </div>

        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-black mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {translation.pinDisplayPrompt}
            </h3>
          </div>

          <PinDisplay length={pin.length} maxLength={4} isError={isError} isLight={isLight} />
          
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-10 transition-colors duration-300 ${isError ? 'text-red-500 animate-pulse' : (isLight ? 'text-slate-400' : 'text-white/30')}`}>
             {isError ? translation.wrongPin : translation.enterPin}
          </p>

          <Keypad onNumberClick={onNumberClick} onDelete={onDelete} isLight={isLight} />
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowForgotModal(true); }}
            className={`mt-8 text-xs font-black uppercase tracking-widest transition-colors ${isLight ? 'text-blue-600/60 hover:text-blue-600' : 'text-white/20 hover:text-white/50'}`}
          >
            {translation.forgotPin}
          </button>

          {/* Botones de Registro/Limpieza */}
          <div className="flex gap-4 w-full mt-10 max-w-[320px]">
            {settings.allowMemberRegistration && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRegister(); }}
                className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border shadow-sm flex items-center justify-center gap-2 ${isLight ? 'bg-white border-slate-100 text-blue-600 hover:bg-slate-50' : 'bg-white/5 border-white/10 text-blue-400'}`}
              >
                <UserPlus size={14} />
                {translation.register}
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border shadow-sm ${isLight ? 'bg-slate-50 border-slate-100 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
            >
              {translation.clear}
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <ForgotPinModal 
          isLight={isLight} 
          translation={translation} 
          onClose={() => setShowForgotModal(false)}
          onSubmit={onForgotPin}
        />
      )}
    </div>
  );
};
