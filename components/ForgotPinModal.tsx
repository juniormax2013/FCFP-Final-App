
import React, { useState } from 'react';
import { X, User, Phone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Translation } from '../types';

interface ForgotPinModalProps {
  onClose: () => void;
  onSubmit: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  isLight: boolean;
  translation: Translation;
}

export const ForgotPinModal: React.FC<ForgotPinModalProps> = ({ onClose, onSubmit, isLight, translation }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) return;
    
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(onClose, 3000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-[40px] overflow-hidden flex flex-col border shadow-2xl relative animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{translation.forgotPin}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 opacity-50"><X size={24}/></button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-10 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center shadow-xl mb-6 transform rotate-12">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h4 className={`text-xl font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{translation.forgotPinSent}</h4>
              <p className={`text-sm opacity-60 leading-relaxed px-4 ${isLight ? 'text-slate-600' : 'text-white'}`}>
                {translation.forgotPinSentSub}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className={`text-xs opacity-50 leading-relaxed mb-6 ${isLight ? 'text-slate-600' : 'text-white'}`}>
                {translation.forgotPinHelp}
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{translation.firstName}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      required
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className={`w-full border rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                      placeholder="..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{translation.lastName}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      required
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className={`w-full border rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                      placeholder="..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{translation.phone}</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className={`w-full border rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                      placeholder="+1..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className={`flex-1 py-4 font-bold rounded-2xl ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white/60'}`}
                >
                  {translation.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={16}/>}
                  {translation.forgotPinBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
