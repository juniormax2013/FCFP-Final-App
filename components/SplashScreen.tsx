import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ChurchLogo } from './ChurchLogo.tsx';

interface SplashScreenProps {
  settings: any;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ settings, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // 2 seconds duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-900"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
        }}
        className="flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-48 h-48 flex items-center justify-center"
        >
          <img 
            src="https://drive.google.com/uc?id=1IQrH7rMgENdOEPTIN19BqbaZoK5n6cjl" 
            alt="Splash Logo" 
            className="w-full h-full object-contain drop-shadow-2xl" 
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
