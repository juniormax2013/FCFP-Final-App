
import React from 'react';

interface PinDisplayProps {
  length: number;
  maxLength: number;
  isError: boolean;
  isLight: boolean;
}

export const PinDisplay: React.FC<PinDisplayProps> = ({ length, maxLength, isError, isLight }) => {
  return (
    <div className={`flex gap-3 justify-center my-6 ${isError ? 'animate-shake' : ''}`}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <div
          key={i}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
            isError 
              ? 'border-red-500 bg-red-50'
              : i < length 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/5'
          } shadow-sm`}
        >
          {(i < length || isError) && (
            <div className={`w-3 h-3 rounded-full animate-in zoom-in duration-300 ${isError ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`} />
          )}
        </div>
      ))}
    </div>
  );
};