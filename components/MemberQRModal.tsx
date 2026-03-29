
import React, { useEffect, useState } from 'react';
import { X, Download, QrCode, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { Member, SystemSettings, Translation } from '../types';

interface MemberQRModalProps {
  member: Member;
  onClose: () => void;
  isLight: boolean;
  translation: Translation;
}

export const MemberQRModal: React.FC<MemberQRModalProps> = ({ member, onClose, isLight, translation }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(member.id, {
      width: 800, // High quality for printing/scanning
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, (err, url) => {
      if (err) console.error(err);
      setQrUrl(url);
    });
  }, [member.id]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${member.firstName}_${member.lastName}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-[48px] p-8 sm:p-10 border shadow-2xl relative animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 opacity-50"><X size={24} className={isLight ? 'text-slate-900' : 'text-white'}/></button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
            <QrCode size={32} />
          </div>
          
          <h4 className={`text-2xl font-black mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{translation.digitalID}</h4>
          <p className="text-sm opacity-50 mb-8 uppercase font-black tracking-widest">{member.firstName} {member.lastName}</p>
          
          <div className={`p-6 rounded-[40px] border-4 mb-8 shadow-inner ${isLight ? 'bg-white border-slate-50' : 'bg-white border-white'}`}>
            {qrUrl ? (
              <img src={qrUrl} className="w-64 h-64 sm:w-80 sm:h-80 object-contain" alt="QR Member" />
            ) : (
              <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center bg-slate-100">
                <QrCode className="animate-pulse opacity-20" size={64} />
              </div>
            )}
          </div>
          
          <div className={`px-6 py-3 rounded-2xl mb-10 border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white/5 border-white/10 text-white/40'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{translation.memberID}</p>
            <p className="text-lg font-mono font-bold text-blue-500 tracking-wider">{member.id}</p>
          </div>
          
          <div className="grid grid-cols-1 w-full gap-3">
            <button 
              onClick={handleDownload}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Download size={20} /> {translation.downloadQR}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
