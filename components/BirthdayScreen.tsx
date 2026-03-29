
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Cake, Sparkles, Phone, MessageSquare, Download, Loader2, Share2, Search, X } from 'lucide-react';
import { Translation, Member, SystemSettings, User } from '../types';
import { formatToMMDDYYYY } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';

interface BirthdayScreenProps {
  translation: Translation;
  settings: SystemSettings;
  members: Member[];
  onBack: () => void;
  currentUser: User;
}

type BirthdayFilter = 'today' | 'thisWeek' | 'thisMonth';

export const BirthdayScreen: React.FC<BirthdayScreenProps> = ({ translation, settings, members, onBack, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState<BirthdayFilter>('today');
  const [isGenerating, setIsGenerating] = useState<string | null>(null); // Member ID or 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlyerModal, setShowFlyerModal] = useState<string | null>(null); // Image URL

  const isLight = settings.theme === 'light';
  
  // RESTRICCIÓN SOLICITADA: Solo ID 1, Admin y Secretaria
  const canManageBirthday = currentUser.id === '1' || currentUser.role === 'admin' || currentUser.role === 'secretaria';

  const getLocalBDate = (birthDateStr: string) => {
    const [year, month, day] = birthDateStr.split('T')[0].split('-');
    const now = new Date();
    return new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day));
  };

  const isSameDay = (bDate: Date, now: Date) => {
    return bDate.getDate() === now.getDate() && bDate.getMonth() === now.getMonth();
  };

  const isThisWeek = (bDate: Date) => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()), 23, 59, 59, 999);
    return bDate >= startOfWeek && bDate <= endOfWeek;
  };

  const isThisMonth = (bDate: Date) => {
    const now = new Date();
    return bDate.getMonth() === now.getMonth();
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const [year, month, day] = birthDate.split('T')[0].split('-');
    let age = today.getFullYear() - parseInt(year);
    const m = today.getMonth() - (parseInt(month) - 1);
    if (m < 0 || (m === 0 && today.getDate() < parseInt(day))) age--;
    return age;
  };

  const birthdayMembers = useMemo(() => {
    const now = new Date();
    return members.filter(m => {
      if (!m.birthDate) return false;
      const bDate = getLocalBDate(m.birthDate);
      let matchesFilter = false;
      if (activeFilter === 'today') matchesFilter = isSameDay(bDate, now);
      else if (activeFilter === 'thisWeek') matchesFilter = isThisWeek(bDate);
      else if (activeFilter === 'thisMonth') matchesFilter = isThisMonth(bDate);
      const matchesSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [members, activeFilter, searchTerm]);

  const generateFlyer = async (member: Member): Promise<{ name: string; blob: Blob }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Updated prompt to meet the specific requirements (English, structured text)
    const prompt = `Create a professional, highly attractive, vertical birthday flyer for a church member.
    Style: Elegant, celebratory, with golden and royal blue church-appropriate festive elements. Modern, high-quality 4k graphic design.
    
    The flyer MUST include the following specific text in English, formatted beautifully with high-end typography:
    
    1) "HAPPY BIRTHDAY!" (In a large, festive, prominent font at the top)
    2) "${member.firstName} ${member.lastName}" (In a very large, bold, elegant font in the center)
    3) "May God bless you abundantly on your special day." (A short spiritual line neatly placed under the name)
    4) "We thank God for your life and for being part of our church family. May the Lord grant you joy, peace, and strength in this new year of life. We love you and we celebrate you today!" (Formatted as a heartfelt message in 2 to 4 lines)
    5) "— Your Church Family, ${settings.systemName}" (At the very bottom as a signature)
    
    Integrate the provided member photo into an elegant frame or circular mask within the design. The background should be a rich royal blue with subtle golden textures and sparkles.`;

    const parts: any[] = [{ text: prompt }];
    
    // Only add image part if it's a base64 data URL
    if (member.photo && member.photo.startsWith('data:')) {
      const mimeType = member.photo.split(';')[0].split(':')[1];
      parts.unshift({ 
        inlineData: { 
          mimeType: mimeType || 'image/jpeg', 
          data: member.photo.split(',')[1] 
        } 
      });
    } else {
      // If it's a standard URL, we include it in the text description for the AI
      parts[0].text += ` Please use this member's image as reference for the design: ${member.photo}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response from AI model. It might have been blocked by safety filters.');
    }
    
    const candidate = response.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Generation stopped due to: ${candidate.finishReason}`);
    }

    if (!candidate.content || !candidate.content.parts) {
      throw new Error('No content returned from the AI model.');
    }

    let base64Data = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData) { 
        base64Data = part.inlineData.data; 
        break; 
      }
    }

    if (!base64Data) throw new Error('Failed to generate image. The model did not return image data.');
    
    // Use fetch to convert base64 to blob efficiently, avoiding memory issues on mobile
    const blob = await (await fetch(`data:image/png;base64,${base64Data}`)).blob();
    
    return { 
      name: `Flyer_${member.firstName}_${member.lastName}.png`, 
      blob 
    };
  };

  const handleSingleFlyer = async (member: Member) => {
    setIsGenerating(member.id);
    try {
      const { name, blob } = await generateFlyer(member);
      const url = URL.createObjectURL(blob);
      setShowFlyerModal(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
    } catch (error) { 
      console.error(error); 
      alert("Error generating flyer: " + (error instanceof Error ? error.message : String(error))); 
    } finally { 
      setIsGenerating(null); 
    }
  };

  const handleBatchFlyers = async () => {
    if (birthdayMembers.length === 0) return;
    setIsGenerating('all');
    try {
      const zip = new JSZip();
      const results = await Promise.all(birthdayMembers.map(m => generateFlyer(m)));
      results.forEach(res => zip.file(res.name, res.blob));
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a'); 
      link.href = url; 
      link.download = `Flyers_Cumpleanos.zip`; 
      link.click();
    } catch (error) { 
      console.error(error); 
      alert("Error generating batch flyers: " + (error instanceof Error ? error.message : String(error))); 
    } finally { 
      setIsGenerating(null); 
    }
  };

  const handleAction = (member: Member, type: 'call' | 'sms' | 'whatsapp') => {
    const cleanPhone = member.phone.replace(/\D/g, '');
    const message = `Hello ${member.firstName}! We wish you a very happy birthday from your family at ${settings.systemName}. May God bless you greatly today.`;
    if (type === 'call') window.open(`tel:${member.phone}`);
    else if (type === 'sms') window.open(`sms:${member.phone}?body=${encodeURIComponent(message)}`);
    else if (type === 'whatsapp') window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2"><Cake className="text-pink-500" /> {translation.birthdays}</h2>
            <p className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Celebration</p>
          </div>
        </div>
        {canManageBirthday && birthdayMembers.length > 0 && (
          <button disabled={isGenerating !== null} onClick={handleBatchFlyers} className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95 disabled:opacity-50">
            {isGenerating === 'all' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            <span className="hidden sm:inline font-bold text-sm">{translation.generateAllFlyers}</span>
          </button>
        )}
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input type="text" placeholder="Search birthday person..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>

        <div className={`flex p-1 rounded-2xl border mb-10 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
          {(['today', 'thisWeek', 'thisMonth'] as BirthdayFilter[]).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-pink-600 text-white shadow-lg' : (isLight ? 'text-slate-400 hover:text-slate-900' : 'text-white/30 hover:text-white/60')}`}>
              {translation[f]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthdayMembers.map((m) => (
            <div key={m.id} className={`rounded-[40px] p-6 flex flex-col items-center gap-4 group transition-all border relative overflow-hidden shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-pink-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="relative">
                <div className={`w-24 h-24 rounded-[32px] overflow-hidden border-4 ${isLight ? 'border-slate-50' : 'border-white/10'}`}>
                   <img src={m.photo} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-2 bg-pink-500 text-white flex items-center justify-center font-black text-xs">
                  {calculateAge(m.birthDate)}
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg">{m.firstName} {m.lastName}</h4>
                <p className={`text-[10px] uppercase font-black tracking-widest opacity-40`}>
                  {formatToMMDDYYYY(m.birthDate)}
                </p>
              </div>
              
              {/* CONTACT RESTRICTION */}
              {canManageBirthday && (
                <div className="flex items-center gap-2 w-full">
                   <button onClick={() => handleAction(m, 'call')} className="flex-1 p-3 rounded-2xl bg-green-500/10 text-green-500"><Phone size={18} className="mx-auto" /></button>
                   <button onClick={() => handleAction(m, 'whatsapp')} className="flex-1 p-3 rounded-2xl bg-green-500/10 text-green-600"><MessageSquare size={18} className="mx-auto" /></button>
                   <button onClick={() => handleAction(m, 'sms')} className="flex-1 p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Share2 size={18} className="mx-auto" /></button>
                </div>
              )}
              
              {/* INDIVIDUAL FLYERS RESTRICTION */}
              {canManageBirthday && (
                <button disabled={isGenerating !== null} onClick={() => handleSingleFlyer(m)} className="w-full py-3 border rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-pink-600 hover:text-white">
                  {isGenerating === m.id ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {translation.generateFlyer}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showFlyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
           <div className="max-w-lg w-full flex flex-col gap-6">
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-white">
                 <img src={showFlyerModal} className="w-full h-auto" />
                 <button onClick={() => setShowFlyerModal(null)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white"><X size={20}/></button>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => { const link = document.createElement('a'); link.href = showFlyerModal; link.download = 'Flyer.png'; link.click(); }} className="flex-1 py-4 bg-pink-600 rounded-[24px] font-bold text-white flex items-center justify-center gap-2 shadow-xl">Descargar</button>
                 <button onClick={() => setShowFlyerModal(null)} className="flex-1 py-4 bg-white/10 text-white rounded-[24px] font-bold">Cerrar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
