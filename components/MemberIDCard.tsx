
import React, { useEffect, useState } from 'react';
import { X, Download, ShieldCheck, Award, Zap, QrCode, Calendar, Info, Globe } from 'lucide-react';
import QRCode from 'qrcode';
import { Member, Translation, SystemSettings } from '../types';
import { formatToMMDDYYYY } from '@/lib/utils';
import { ChurchLogo } from './ChurchLogo';

interface MemberIDCardProps {
  member: Member;
  onClose: () => void;
  isLight: boolean;
  translation: Translation;
  settings: SystemSettings;
}

export const MemberIDCard: React.FC<MemberIDCardProps> = ({ member, onClose, isLight, translation, settings }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(member.id, {
      width: 600, // Increased resolution
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    }, (err, url) => {
      if (err) console.error(err);
      setQrUrl(url);
    });
  }, [member.id]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `ID_${member.firstName}_${member.lastName}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/90 animate-in fade-in duration-500">
      <div className="relative w-full max-w-sm flex flex-col gap-6 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* The ID Card Container */}
        <div className={`relative w-full aspect-[1/1.58] rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-white/10'}`}>
          
          {/* Holographic / Gradient Background Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />

          {/* Card Content */}
          <div className="relative h-full flex flex-col p-8">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col">
                <h1 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Digital Identity</h1>
                <h2 className={`text-sm font-black tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>{settings.systemName}</h2>
              </div>
              <div className="w-12 h-12">
                 {settings.systemLogo ? (
                   <div className="w-full h-full rounded-xl bg-white p-1 shadow-lg flex items-center justify-center overflow-hidden border border-slate-100">
                     <img src={settings.systemLogo} className="w-full h-full object-contain" alt="System Logo" />
                   </div>
                 ) : (
                   <ChurchLogo className="w-full h-full shadow-lg" />
                 )}
              </div>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className={`relative w-28 h-28 rounded-[32px] p-1 border-2 transition-transform hover:scale-105 duration-500 ${isLight ? 'border-blue-500/30' : 'border-white/20'}`}>
                <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-800">
                  <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                </div>
                {member.baptismDate && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl bg-blue-600 flex items-center justify-center border-4 border-[#111] shadow-lg">
                    <ShieldCheck size={14} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Member Info */}
            <div className="text-center space-y-1 mb-6">
              <h3 className={`text-2xl font-black tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {member.firstName} {member.lastName}
              </h3>
              <div className="flex items-center justify-center gap-2">
                 <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                    {member.churchRole}
                 </span>
                 <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white/5 text-white/40 border-white/10'}`}>
                    {member.memberType}
                 </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mb-1">Ecclesial UID</p>
                <p className="text-[10px] font-mono font-bold text-blue-500">{member.id}</p>
              </div>
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mb-1">Member Since</p>
                <p className={`text-[10px] font-bold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{member.entryDate ? formatToMMDDYYYY(member.entryDate) : '---'}</p>
              </div>
            </div>

            {/* QR Section - LARGE SIZE */}
            <div className="mt-auto flex flex-col items-center gap-4">
              <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-2 border-2 flex items-center justify-center shadow-xl ${isLight ? 'bg-white border-slate-100' : 'bg-white border-white'}`}>
                {qrUrl ? (
                  <img src={qrUrl} className="w-full h-full object-contain" alt="QR Code" />
                ) : (
                  <QrCode className="opacity-10" size={48} />
                )}
              </div>
              
              <div className="w-full flex justify-between items-center opacity-60">
                <div className="flex items-center gap-1.5">
                  <Zap size={10} className="text-amber-500" />
                  <p className="text-[7px] font-black uppercase tracking-widest">Fast Check-in</p>
                </div>
                <p className="text-[7px] font-bold">{member.country} • {member.city}</p>
              </div>
            </div>

            {/* Decorative Card Stripe */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 rounded-bl-[100px] pointer-events-none" />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className={`flex-1 py-4 rounded-[24px] font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-white/10 text-white border border-white/10'}`}
          >
            <X size={18} /> {translation.close}
          </button>
          <button 
            onClick={handleDownload}
            className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-bold shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Download size={18} /> {translation.downloadQR}
          </button>
        </div>
      </div>
    </div>
  );
};
