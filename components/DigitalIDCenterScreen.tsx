
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, IdCard, ChevronRight, Check } from 'lucide-react';
import { Translation, Member, SystemSettings } from '../types';
import { MemberIDCard } from './MemberIDCard';

interface DigitalIDCenterScreenProps {
  translation: Translation;
  settings: SystemSettings;
  members: Member[];
  onBack: () => void;
}

export const DigitalIDCenterScreen: React.FC<DigitalIDCenterScreenProps> = ({ translation, settings, members, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const isLight = settings.theme === 'light';

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`px-6 py-6 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{translation.digitalIDCenter}</h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-blue-500">Gestión de Identidad Digital</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-10 group">
            <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
            <input 
              type="text" 
              placeholder={translation.searchBy} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300' : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'}`} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMembers.map((m) => (
              <div 
                key={m.id} 
                onClick={() => setViewingMember(m)}
                className={`rounded-[32px] p-5 flex items-center gap-4 transition-all group cursor-pointer active:scale-[0.98] shadow-lg border ${isLight ? 'bg-white border-slate-100 hover:border-blue-500/30' : 'glass border-white/5 hover:bg-white/10 hover:border-blue-500/30'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-colors shadow-inner ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                    <img src={m.photo} alt={m.firstName} className="w-full h-full object-cover" />
                  </div>
                  {m.isActive && (
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-green-500 ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`}>
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="font-bold text-base truncate">{m.firstName} {m.lastName}</h4>
                  <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">{m.memberType} • {m.id}</p>
                </div>
                <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20">
                <IdCard size={64} className="mx-auto mb-4" />
                <p className="text-xl font-bold italic">No members found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingMember && (
        <MemberIDCard 
          member={viewingMember}
          onClose={() => setViewingMember(null)}
          isLight={isLight}
          translation={translation}
          settings={settings}
        />
      )}
    </div>
  );
};
