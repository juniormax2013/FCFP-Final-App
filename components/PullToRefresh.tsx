
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isLight: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh, isLight }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = (e: TouchEvent) => {
    const scrollContainer = containerRef.current;
    if (scrollContainer && scrollContainer.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      // Aplicar fricción logarítmica
      const dampedDistance = Math.min(distance * 0.4, maxPull);
      setPullDistance(dampedDistance);
      
      // Prevenir el scroll por defecto del navegador solo si estamos jalando
      if (distance > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (startY.current === 0 || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        // Breve pausa para que se vea la animación de carga antes de cerrar
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full overflow-y-auto relative scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Indicador de actualización */}
      <div 
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-0"
        style={{ 
          height: `${threshold}px`,
          top: `-${threshold}px`,
          transform: `translateY(${pullDistance}px)`,
          opacity: Math.min(pullDistance / threshold, 1),
          transition: isRefreshing ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s'
        }}
      >
        <div className={`p-3 rounded-full shadow-lg border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-white/10 border-white/10'} backdrop-blur-md`}>
          <Loader2 
            className={`${isRefreshing ? 'animate-spin' : ''} text-blue-500`} 
            size={24} 
            style={{ 
              transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg) scale(${Math.min(pullDistance / threshold, 1)})` 
            }}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div 
        className="relative z-10 w-full min-h-full transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
