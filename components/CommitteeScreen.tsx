
import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Plus, Search, X, Camera, Trash2, Edit3, ChevronRight, User as UserIcon, Calendar, Briefcase, Shield, Image as ImageIcon, Check, Filter, LayoutPanelTop, UserPlus, Award, Layers, AlertTriangle } from 'lucide-react';
import { User, Translation, Member, SystemSettings, Committee, CommitteeMember, CommitteeRole } from '../types';
import { getLocalYYYYMMDD } from '../lib/utils';

interface CommitteeFormModalProps {
  initialData?: Committee;
  onClose: () => void;
  onSave: (c: Committee) => void;
  isLight: boolean;
  translation: Translation;
  departments: string[];
  membersList: Member[];
  committeeTypes: string[];
  committeeRoles: CommitteeRole[];
}

const CommitteeFormModal: React.FC<CommitteeFormModalProps> = ({ 
  initialData, onClose, onSave, isLight, translation, departments, membersList, committeeTypes, committeeRoles 
}) => {
  const safeDepts = departments || [];
  const safeTypes = committeeTypes || [];
  const safeRoles = committeeRoles || [];

  const [formData, setFormData] = useState<Partial<Committee>>(initialData || {
    department: safeDepts[0] || '',
    type: safeTypes[0] || '',
    startDate: getLocalYYYYMMDD(),
    endDate: '',
    status: 'Active',
    members: initialData?.members || [],
    logo: initialData?.logo || null
  });
  
  const [memberSearch, setMemberSearch] = useState('');
  const [memberToAssign, setMemberToAssign] = useState<Member | null>(null);
  const [tempPositionId, setTempPositionId] = useState(safeRoles[0]?.id || '');
  const logoRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();
    if (!search) return [];
    return membersList.filter(m => 
      (`${m.firstName} ${m.lastName}`.toLowerCase().includes(search) || 
       m.id.toLowerCase().includes(search)) &&
      !formData.members?.some(cm => cm.memberId === m.id)
    ).slice(0, 5);
  }, [memberSearch, membersList, formData.members]);

  const startAssignMember = (m: Member) => {
    setMemberToAssign(m);
    setTempPositionId(safeRoles[0]?.id || '');
    setMemberSearch('');
  };

  const confirmAddMember = () => {
    const role = safeRoles.find(r => r.id === tempPositionId);
    if (!memberToAssign || !role) return;
    
    const newCM: CommitteeMember = {
      id: Date.now().toString(),
      memberId: memberToAssign.id,
      name: `${memberToAssign.firstName} ${memberToAssign.lastName}`,
      photo: memberToAssign.photo,
      position: role.name,
      order: (formData.members?.length || 0) + 1
    };
    
    setFormData(prev => ({ 
      ...prev, 
      members: [...(prev.members || []), newCM] 
    }));
    
    setMemberToAssign(null);
    setTempPositionId(safeRoles[0]?.id || '');
  };

  const removeMember = (id: string) => {
    setFormData(prev => ({ ...prev, members: prev.members?.filter(m => m.id !== id) }));
  };

  const handleSave = () => {
    if (!formData.department || !formData.type) return;
    onSave({
      ...formData,
      id: formData.id || `C-${Date.now().toString().slice(-6)}`,
      createdAt: formData.createdAt || new Date().toISOString()
    } as Committee);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-2xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Briefcase size={20} className="text-blue-500" />
            {initialData ? translation.edit : translation.addCommittee}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          <div className="flex flex-col items-center">
            <div 
              onClick={() => logoRef.current?.click()}
              className={`relative w-24 h-24 rounded-3xl overflow-hidden border-2 flex items-center justify-center cursor-pointer group transition-all ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}
            >
              {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain" /> : <ImageIcon className="opacity-20" size={32} />}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
              <input type="file" ref={logoRef} className="hidden" accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader();
                  r.onload = () => setFormData({ ...formData, logo: r.result as string });
                  r.readAsDataURL(f);
                }
              }} />
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-40">{translation.committeeLogo}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest px-1 opacity-40`}>{translation.department}</label>
              <select 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none appearance-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
              >
                {safeDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest px-1 opacity-40`}>{translation.committeeTypes}</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none appearance-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
              >
                {safeTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest px-1 opacity-40`}>{translation.status}</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none appearance-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
              >
                <option value="Active">{translation.active}</option>
                <option value="Inactive">{translation.inactive}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest px-1 opacity-40`}>{translation.committeeStartDate}</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-widest px-1 opacity-40">{translation.committeeMembers}</h4>
            
            {!memberToAssign ? (
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                  type="text" 
                  placeholder={translation.addParticipant} 
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className={`w-full border rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                />
                {filteredSuggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-top-2 ${isLight ? 'bg-white' : 'bg-slate-900 border-white/10'}`}>
                    {filteredSuggestions.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => startAssignMember(m)} 
                        className={`w-full flex items-center gap-3 p-3 hover:bg-blue-500/10 transition-colors text-left border-b last:border-0 ${isLight ? 'border-slate-50' : 'border-white/5'}`}
                      >
                        <img src={m.photo} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-bold">{m.firstName} {m.lastName}</p>
                          <p className="text-[9px] font-black uppercase opacity-40">{m.memberType}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-4 rounded-3xl border flex flex-col gap-4 animate-in zoom-in-95 ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'}`}>
                <div className="flex items-center gap-3">
                  <img src={memberToAssign.photo} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-bold">{memberToAssign.firstName} {memberToAssign.lastName}</p>
                    <p className="text-[10px] font-black uppercase text-blue-500">{translation.committeeFunction}</p>
                  </div>
                  <button onClick={() => setMemberToAssign(null)} className="ml-auto p-2 opacity-40 hover:opacity-100"><X size={16}/></button>
                </div>
                <div className="flex gap-2">
                  <select 
                    autoFocus
                    value={tempPositionId}
                    onChange={e => setTempPositionId(e.target.value)}
                    className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none appearance-none ${isLight ? 'bg-white border-blue-200' : 'bg-white/5 border-white/10'}`}
                  >
                    {safeRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={confirmAddMember}
                    className="p-3 bg-blue-600 text-white rounded-xl shadow-lg"
                  >
                    <Check size={20}/>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.members || []).map(cm => (
                <div key={cm.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={cm.photo} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{cm.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Award size={10} className="text-blue-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 truncate">{cm.position}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeMember(cm.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{translation.cancel}</button>
          <button onClick={handleSave} className="flex-[2] py-4 bg-blue-600 rounded-3xl font-bold text-white shadow-xl active:scale-95 transition-all">{translation.save}</button>
        </div>
      </div>
    </div>
  );
};

export const CommitteeScreen: React.FC<{
  translation: Translation; settings: SystemSettings; members: Member[]; committees: Committee[]; departments: string[];
  committeeRoles: CommitteeRole[]; committeeTypes: string[];
  onBack: () => void; onAdd: (c: Committee) => void; onUpdate: (c: Committee) => void; onDelete: (id: string) => void;
}> = ({ translation, settings, members, committees, departments, committeeRoles, committeeTypes, onBack, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<Committee | null>(null);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isLight = settings.theme === 'light';

  const filtered = (committees || []).filter(c => 
    c.department.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
      setViewing(null);
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{translation.moduleNames.committee}</h2>
            <p className={`text-[10px] uppercase font-black tracking-widest ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{translation.attendanceControl}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-all shadow-lg active:scale-95"><Plus size={18} /><span className="hidden sm:inline font-bold text-sm">{translation.addCommittee}</span></button>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={translation.searchBy} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(c => (
            <div 
              key={c.id} 
              onClick={() => setViewing(c)}
              className={`rounded-[32px] p-6 border transition-all cursor-pointer group active:scale-[0.98] shadow-lg hover:shadow-xl ${isLight ? 'bg-white border-slate-100 hover:border-blue-200' : 'glass border-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${isLight ? 'bg-slate-50' : 'bg-white/5 border-white/10'}`}>
                  {c.logo ? <img src={c.logo} className="w-full h-full object-contain" /> : <Shield size={24} className="opacity-20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold tracking-tight truncate">{c.department}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-blue-500/10 text-blue-500`}>{c.type}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setDeletingId(c.id); }}
                     className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 z-10"
                   >
                     <Trash2 size={16}/>
                   </button>
                   <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <div className="flex -space-x-2 overflow-hidden mt-6">
                {(c.members || []).slice(0, 6).map(cm => (
                  <img key={cm.id} src={cm.photo} className={`w-9 h-9 rounded-full border-2 ${isLight ? 'border-white' : 'border-[#1a1a1a]'} object-cover shadow-sm`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewing && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-4xl rounded-[40px] overflow-hidden flex flex-col max-h-[95vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}>
                  {viewing.logo ? <img src={viewing.logo} className="w-full h-full object-contain" /> : <Shield size={20} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{viewing.department}</h3>
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.2em]">{viewing.type}</p>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'}`}><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-hide">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(viewing.members || []).map(cm => (
                   <div key={cm.id} className={`flex items-center gap-4 p-4 rounded-3xl border shadow-sm ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <img src={cm.photo} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                      <div className="min-w-0">
                         <p className="font-black text-sm truncate">{cm.name}</p>
                         <p className="text-[10px] font-black uppercase text-blue-500 truncate">{cm.position}</p>
                      </div>
                   </div>
                ))}
              </div>
            </div>

            <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
              <button 
                onClick={() => setDeletingId(viewing.id)} 
                className="flex-1 py-4 font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                {translation.delete}
              </button>
              <button 
                onClick={() => { setEditing(viewing); setViewing(null); }} 
                className="flex-[2] py-4 bg-blue-600 rounded-3xl font-bold text-white shadow-xl hover:bg-blue-500 transition-all active:scale-95"
              >
                {translation.edit}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
           <div className={`w-full max-w-sm rounded-[40px] p-8 border text-center shadow-2xl animate-in zoom-in-95 ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
              <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                 <AlertTriangle size={40} />
              </div>
              <h4 className="text-xl font-bold mb-2">{translation.deleteCommitteeTitle}</h4>
              <p className={`text-sm opacity-50 mb-8 ${isLight ? 'text-slate-900' : 'text-white'}`}>{translation.deleteCommitteeDesc}</p>
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={handleDeleteConfirm}
                  className="w-full py-4 bg-red-600 text-white rounded-[24px] font-bold shadow-xl active:scale-95 transition-all"
                 >
                   {translation.delete}
                 </button>
                 <button 
                  onClick={() => setDeletingId(null)}
                  className={`w-full py-4 rounded-[24px] font-bold ${isLight ? 'text-slate-900 hover:bg-slate-50' : 'text-white hover:bg-white/5'}`}
                 >
                   {translation.cancel}
                 </button>
              </div>
           </div>
        </div>
      )}

      {(showForm || editing) && (
        <CommitteeFormModal 
          membersList={members} 
          departments={departments} 
          committeeRoles={committeeRoles}
          committeeTypes={committeeTypes}
          isLight={isLight} 
          translation={translation} 
          initialData={editing || undefined} 
          onClose={() => { setShowForm(false); setEditing(null); }} 
          onSave={c => { if(editing) onUpdate(c); else onAdd(c); setShowForm(false); setEditing(null); }} 
        />
      )}
    </div>
  );
};
