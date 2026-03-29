
import React from 'react';

interface KeypadProps {
  onNumberClick: (num: string) => void;
  onDelete: () => void;
  isLight: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onNumberClick, onDelete, isLight }) => {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
      {buttons.slice(0, 9).map((btn) => (
        <button
          key={btn}
          onClick={() => onNumberClick(btn)}
          className={`ios-button h-16 sm:h-18 rounded-2xl text-xl font-medium flex items-center justify-center transition-all shadow-sm border ${
            isLight 
              ? 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          {btn}
        </button>
      ))}
      <div /> {/* Spacer */}
      <button
        onClick={() => onNumberClick('0')}
        className={`ios-button h-16 sm:h-18 rounded-2xl text-xl font-medium flex items-center justify-center transition-all shadow-sm border ${
          isLight 
            ? 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50' 
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        }`}
      >
        0
      </button>
      <div /> {/* Spacer */}
    </div>
  );
};
