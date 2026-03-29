import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS prompt after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-5 relative overflow-hidden">
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Download className="text-white" size={28} />
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Install App</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Install this app on your device for quick access and a better experience.
            </p>
            
            {isIOS ? (
              <div className="mt-4 bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                  1. Tap the <Share size={18} className="text-blue-500" /> Share button
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  2. Select <PlusSquare size={18} className="text-slate-500 dark:text-slate-400" /> Add to Home Screen
                </p>
              </div>
            ) : (
              <button 
                onClick={handleInstallClick}
                className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-all shadow-md active:scale-[0.98]"
              >
                Install Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
