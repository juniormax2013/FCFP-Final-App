
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, MessageSquareHeart, X, Check, Trash2, Edit3, History, Calendar, ArrowRight, User as UserIcon, AlertCircle, Info, Hand } from 'lucide-react';
import { User, Translation, Member, Prayer, PrayerAudit, SystemSettings } from '../types';
import { formatToMMDDYYYY } from '../lib/utils';

interface PrayerFormModalProps {
  initialData?: Prayer; onClose: () => void; onSave: (p: Prayer) => void; translation: Translation; currentUser: User; members: Member[]; isLight: boolean;
}

const PrayerFormModal: React.FC<PrayerFormModalProps> = ({ initialData, onClose, onSave, translation, currentUser, members, isLight }) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(initialData?.memberId ? members.find(m => m.id === initialData.memberId) || null : null);
  const [personName, setPersonName] = useState(initialData?.personName || '');
  const [reason, setReason] = useState(initialData?.reason || '');
  const [isUrgent, setIsUrgent] = useState(initialData?.isUrgent || false);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const filteredMembers = useMemo(() => memberSearch ? members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 5) : [], [memberSearch, members]);

  const handleSave = () => {
    const finalName = selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : personName;
    if (!finalName.trim() || !reason.trim()) { alert("Complete los campos obligatorios."); return; }
    const timestamp = new Date().toISOString();
    if (initialData) {
      const audit: PrayerAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'update', timestamp };
      onSave({ ...initialData, personName: finalName, memberId: selectedMember?.id, memberPhoto: selectedMember?.photo, reason, isUrgent, notes, audits: [audit, ...initialData.audits] });
    } else {
      const audit: PrayerAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'create', timestamp };
      onSave({ id: `P-${Date.now().toString().slice(-6)}`, personName: finalName, memberId: selectedMember?.id, memberPhoto: selectedMember?.photo, reason, isUrgent, notes, date: timestamp, registeredBy: `${currentUser.firstName} ${currentUser.lastName}`, registeredById: currentUser.id, audits: [audit], updatedAt: timestamp });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}><MessageSquareHeart size={20} className="text-sky-500" />{initialData ? translation.edit : translation.addPrayer}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          <div className="space-y-4">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Prayer Person</label>
            {selectedMember ? (
              <div className={`flex items-center justify-between p-4 rounded-3xl border ${isLight ? 'bg-sky-50 border-sky-100' : 'bg-sky-500/10 border-sky-500/30'}`}>
                <div className="flex items-center gap-3"><img src={selectedMember.photo} className="w-10 h-10 rounded-xl object-cover" alt="M" /><p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedMember.firstName} {selectedMember.lastName}</p></div>
                {!initialData && <button onClick={() => setSelectedMember(null)}><X size={18} /></button>}
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="Search Member..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className={`w-full border rounded-2xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
                {filteredMembers.length > 0 && (
                  <div className={`border rounded-2xl overflow-hidden ${isLight ? 'bg-white border-slate-100 shadow-lg' : 'bg-slate-900 border-white/10'}`}>{filteredMembers.map(m => <button key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(''); }} className={`w-full flex items-center gap-3 p-3 text-left border-b last:border-0 ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}><img src={m.photo} className="w-8 h-8 rounded-lg object-cover" /><span className="text-xs font-bold">{m.firstName} {m.lastName}</span></button>)}</div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2"><label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Reason</label><textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Prayer reason..." className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none min-h-[100px] transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} /></div>
        </div>
        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
           <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{translation.cancel}</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-sky-600 rounded-3xl font-bold text-white shadow-xl active:scale-95 transition-all">{translation.save}</button>
        </div>
      </div>
    </div>
  );
};

interface PrayerScreenProps {
  currentUser: User; translation: Translation; members: Member[]; prayers: Prayer[]; settings: SystemSettings; onBack: () => void; onAddPrayer: (p: Prayer) => void; onUpdatePrayer: (p: Prayer) => void; onDeletePrayer: (id: string) => void;
  isRestricted: boolean;
  permissions?: any;
}

export const PrayerScreen: React.FC<PrayerScreenProps> = ({ currentUser, translation, members, prayers, settings, onBack, onAddPrayer, onUpdatePrayer, onDeletePrayer, isRestricted, permissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [viewingPrayer, setViewingPrayer] = useState<Prayer | null>(null);
  const isLight = settings.theme === 'light';

  const filteredPrayers = useMemo(() => {
    return prayers.filter(p => {
      const matchesSearch = p.personName.toLowerCase().includes(searchTerm.toLowerCase()) || p.reason.toLowerCase().includes(searchTerm.toLowerCase());
      // RESTRICCIONES ELIMINADAS: Todos ven todo
      return matchesSearch;
    });
  }, [prayers, searchTerm]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{translation.prayers}</h2>
            <p className={`text-[10px] font-black uppercase opacity-40`}>Gestión de Oración</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"><Plus size={18} /> <span className="hidden sm:inline font-bold text-sm">{translation.addPrayer}</span></button>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input type="text" placeholder="Buscar peticiones..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {filteredPrayers.map((p) => (
            <div key={p.id} onClick={() => setViewingPrayer(p)} className={`rounded-[32px] p-6 flex items-center justify-between group transition-all border cursor-pointer active:scale-[0.99] shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-sky-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isLight ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}><MessageSquareHeart size={24} /></div>
                <div><h4 className="font-bold text-base">{p.personName}</h4><p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{formatToMMDDYYYY(p.date)} • {p.isUrgent ? 'URGENTE' : 'REGULAR'}</p></div>
              </div>
              <ArrowRight size={14} className={`${isLight ? 'text-slate-200' : 'text-white/10'}`} />
            </div>
          ))}
          {filteredPrayers.length === 0 && (
            <div className="py-24 text-center opacity-20"><Hand size={64} className="mx-auto mb-4" /><p className="text-xl font-bold">No hay peticiones registradas</p></div>
          )}
        </div>
      </div>
      {viewingPrayer && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
           <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
              <div className={`p-8 flex items-start justify-between border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><h3 className="text-2xl font-black">Detalle de Petición</h3><button onClick={() => setViewingPrayer(null)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button></div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"><div className={`p-6 rounded-[32px] border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Motivo / Razón</p><p className="text-lg font-bold">{viewingPrayer.reason}</p></div></div>
              <div className={`p-6 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <button onClick={() => { onDeletePrayer(viewingPrayer.id); setViewingPrayer(null); }} className="flex-1 py-4 font-bold text-red-500">Delete</button>
                <button onClick={() => { setEditingPrayer(viewingPrayer); setViewingPrayer(null); }} className="flex-[2] py-4 bg-sky-600 rounded-2xl font-bold text-white shadow-xl">Edit</button>
              </div>
           </div>
        </div>
      )}
      {(showAddModal || editingPrayer) && <PrayerFormModal isLight={isLight} initialData={editingPrayer || undefined} onClose={() => { setShowAddModal(false); setEditingPrayer(null); }} translation={translation} currentUser={currentUser} members={members} onSave={(p) => { if (editingPrayer) onUpdatePrayer(p); else onAddPrayer(p); setShowAddModal(false); setEditingPrayer(null); }} />}
    </div>
  );
};
