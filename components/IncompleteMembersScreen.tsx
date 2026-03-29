
import React, { useMemo } from 'react';
import { ArrowLeft, AlertCircle, UserCheck, ChevronRight, Mail, Phone, MapPin, Calendar, Image as ImageIcon, Heart, Globe, Briefcase, Shield } from 'lucide-react';
import { Translation, Member, SystemSettings } from '../types';

interface IncompleteMembersScreenProps {
  members: Member[];
  translation: Translation;
  settings: SystemSettings;
  onBack: () => void;
  onEditMember: (m: Member) => void;
}

export const IncompleteMembersScreen: React.FC<IncompleteMembersScreenProps> = ({
  members, translation, settings, onBack, onEditMember
}) => {
  const isLight = settings.theme === 'light';

  const checkIsIncomplete = (m: Member) => {
    const missing = [];
    const isPhotoMissing = !m.photo || m.photo.includes('unsplash.com/photo-1633332755192-727a05c4013d');
    if (isPhotoMissing) missing.push('photo');
    if (!m.phone || m.phone.trim().length < 5) missing.push('phone');
    if (!m.email || !m.email.includes('@')) missing.push('email');
    if (!m.address || m.address.trim().length < 5) missing.push('address');
    if (!m.birthDate) missing.push('birthDate');
    if (!m.civilStatus) missing.push('civilStatus');
    if (!m.nationality) missing.push('nationality');
    if (!m.churchRole || m.churchRole.trim() === '') missing.push('churchRole');
    if (!m.department || m.department.trim() === '') missing.push('department');
    return missing;
  };

  const incompleteMembers = useMemo(() => {
    return members.filter(m => !m.deletedAt && checkIsIncomplete(m).length > 0);
  }, [members]);

  const getMissingIcons = (missing: string[]) => {
    const iconSize = 14;
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {missing.includes('phone') && <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500"><Phone size={iconSize} /></div>}
        {missing.includes('email') && <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500"><Mail size={iconSize} /></div>}
        {missing.includes('address') && <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><MapPin size={iconSize} /></div>}
        {missing.includes('birthDate') && <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500"><Calendar size={iconSize} /></div>}
        {missing.includes('photo') && <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500"><ImageIcon size={iconSize} /></div>}
        {missing.includes('civilStatus') && <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500"><Heart size={iconSize} /></div>}
        {missing.includes('nationality') && <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500"><Globe size={iconSize} /></div>}
        {missing.includes('churchRole') && <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"><Shield size={iconSize} /></div>}
        {missing.includes('department') && <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><Briefcase size={iconSize} /></div>}
      </div>
    );
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`px-6 py-6 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{translation.incompleteTitle}</h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-amber-500">{incompleteMembers.length} {translation.incompleteSub}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {incompleteMembers.map(m => {
            const missing = checkIsIncomplete(m);
            return (
              <div 
                key={m.id}
                className={`p-6 rounded-[36px] border flex flex-col transition-all group hover:scale-[1.01] shadow-lg ${isLight ? 'bg-white border-slate-100' : 'glass border-white/5'}`}
              >
                <div className="flex items-center gap-5 mb-2">
                  <div 
                    onClick={() => onEditMember(m)}
                    className="relative flex-shrink-0 cursor-pointer"
                  >
                    <div className={`w-20 h-20 rounded-[28px] overflow-hidden border-2 transition-all group-hover:border-blue-500/50 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                      <img src={m.photo} className="w-full h-full object-cover" alt="M" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-4 border-[#0a0a0a] text-white">
                      <AlertCircle size={14} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg truncate leading-tight">{m.firstName} {m.lastName}</h4>
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-0.5">{m.memberType} • {m.id}</p>
                    <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase tracking-tighter">{translation.incompleteFields}: {missing.length}</p>
                  </div>

                  <button 
                    onClick={() => onEditMember(m)}
                    className={`p-3 rounded-2xl transition-all ${isLight ? 'bg-slate-50 text-slate-400 hover:text-blue-600' : 'bg-white/5 text-white/20 hover:text-white'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {getMissingIcons(missing)}
                
                <button 
                  onClick={() => onEditMember(m)}
                  className="mt-6 w-full py-3 bg-blue-600/10 text-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                >
                  {translation.incompleteCompleteBtn}
                </button>
              </div>
            );
          })}

          {incompleteMembers.length === 0 && (
            <div className="col-span-full py-32 text-center animate-in fade-in duration-700">
               <div className="w-24 h-24 rounded-[32px] bg-green-500/10 flex items-center justify-center mx-auto mb-6 text-green-500">
                  <UserCheck size={48} />
               </div>
               <p className="text-2xl font-black italic opacity-30">{translation.incompleteAllDone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
