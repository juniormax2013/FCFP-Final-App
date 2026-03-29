
import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, Check } from 'lucide-react';
import jsQR from 'jsqr';
import { Translation } from '../types';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isLight: boolean;
  title?: string;
  translation: Translation;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isLight, title, translation }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanningActive, setScanningActive] = useState(true);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          setLoading(false);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError(translation.cameraError);
        setLoading(false);
      }
    };

    startCamera();

    const scan = () => {
      if (!scanningActive) return;

      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        if (context) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            setScanningActive(false);
            onScan(code.data);
            return;
          }
        }
      }
      requestRef.current = requestAnimationFrame(scan);
    };

    requestRef.current = requestAnimationFrame(scan);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [onScan, translation.cameraError, scanningActive]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/90 animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-[48px] overflow-hidden flex flex-col border shadow-2xl relative animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Camera size={20} />
             </div>
             <h4 className={`font-black text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>{title || translation.scanQr}</h4>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full opacity-50 hover:opacity-100 transition-all">
            <X size={24} className={isLight ? 'text-slate-900' : 'text-white'} />
          </button>
        </div>

        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black">
              <RefreshCw className="animate-spin text-blue-500" size={40} />
              <p className="text-white/40 text-xs font-black uppercase tracking-widest">{translation.cameraStarting}</p>
            </div>
          )}
          
          {error ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                <X size={32} />
              </div>
              <p className="text-white text-sm font-medium leading-relaxed">{error}</p>
              <button onClick={onClose} className="px-6 py-2 bg-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest">{translation.close}</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-blue-500 rounded-[40px] relative shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                  <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-[32px]" />
                  <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-[32px]" />
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-[32px]" />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-[32px]" />
                  
                  <div className="absolute top-0 left-6 right-6 h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scanLine_2.5s_infinite_ease-in-out]" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 text-center">
           <p className={`text-[11px] font-black uppercase tracking-widest opacity-50 leading-relaxed ${isLight ? 'text-slate-900' : 'text-white'}`}>
             {translation.scanInstruction}
           </p>
           {!scanningActive && !loading && (
             <div className="mt-4 flex items-center justify-center gap-2 text-green-500 animate-pulse">
               <Check size={16} />
               <p className="text-[10px] font-black uppercase tracking-widest">{translation.codeDetected}</p>
             </div>
           )}
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 15%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
