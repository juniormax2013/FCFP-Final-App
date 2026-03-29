
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, DollarSign, X, Check, Trash2, Edit3, History, User as UserIcon, Calendar, Clock, ArrowRight } from 'lucide-react';
import { User, Translation, Member, Tithe, TitheAudit, SystemSettings, EditRequest } from '../types';
import { formatToMMDDYYYY } from '../lib/utils';
import { EditRequestModal } from './EditRequestModal';
import { EditCountdown } from './EditCountdown';

interface TitheFormModalProps {
  initialData?: Tithe;
  onClose: () => void;
  onSave: (t: Tithe) => void;
  isLight: boolean;
  translation: Translation;
  currentUser: User;
  members: Member[];
}

const TitheFormModal: React.FC<TitheFormModalProps> = ({ initialData, onClose, onSave, isLight, translation, currentUser, members }) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(initialData ? members.find(m => m.id === initialData.memberId) || null : null);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const filteredMembersSuggestions = useMemo(() => {
    if (!memberSearch) return [];
    return members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 5);
  }, [memberSearch, members]);

  const handleSave = () => {
    if (!selectedMember || !amount || isNaN(Number(amount))) { alert("Select a member and a valid amount."); return; }
    const numAmount = Number(amount);
    const timestamp = new Date().toISOString();
    if (initialData) {
      const audit: TitheAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'update', timestamp };
      onSave({ ...initialData, amount: numAmount, notes, audits: [audit, ...(initialData.audits || [])] });
    } else {
      const audit: TitheAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'create', timestamp };
      onSave({ id: `T-${Date.now().toString().slice(-6)}`, memberId: selectedMember.id, memberName: `${selectedMember.firstName} ${selectedMember.lastName}`, memberPhoto: selectedMember.photo, amount: numAmount, date: timestamp, registeredBy: `${currentUser.firstName} ${currentUser.lastName}`, registeredById: currentUser.id, notes, audits: [audit], updatedAt: timestamp });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}><DollarSign size={20} className="text-emerald-500" />{initialData ? translation.edit : translation.addTithe}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.selectMember}</label>
            {selectedMember ? (
              <div className={`flex items-center justify-between p-4 rounded-3xl border ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex items-center gap-3">
                  <img src={selectedMember.photo} className="w-10 h-10 rounded-xl object-cover" alt="Member" />
                  <div><p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedMember.firstName} {selectedMember.lastName}</p><p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{selectedMember.id}</p></div>
                </div>
                {!initialData && <button onClick={() => setSelectedMember(null)} className={`p-2 rounded-full ${isLight ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-white/5 text-white/40'}`}><X size={18} /></button>}
              </div>
            ) : (
              <div className="relative group">
                <input type="text" autoFocus placeholder="Search by name..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className={`w-full border rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
                {filteredMembersSuggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 border rounded-[24px] overflow-hidden z-10 shadow-2xl ${isLight ? 'bg-white border-slate-100' : 'bg-slate-900 border-white/10'}`}>
                    {filteredMembersSuggestions.map(m => (
                      <button key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(''); }} className={`w-full flex items-center gap-3 p-3 text-left border-b last:border-0 ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 border-white/5 text-white'}`}><img src={m.photo} className="w-8 h-8 rounded-lg object-cover" alt="Member" /><div><p className="text-xs font-bold">{m.firstName} {m.lastName}</p><p className="text-[9px] opacity-40 font-bold uppercase">{m.id}</p></div></button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.moneyAmount}</label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300' : 'bg-white/5 border-white/10 text-white placeholder:text-white/10'}`} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.notesLabel}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`w-full border rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all min-h-[100px] ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} placeholder="Notas adicionales..." />
          </div>
        </div>
        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
           <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{translation.cancel}</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-emerald-600 rounded-3xl font-bold text-white shadow-xl active:scale-95 transition-all">{translation.confirmAction}</button>
        </div>
      </div>
    </div>
  );
};

interface TitheScreenProps {
  currentUser: User; translation: Translation; settings: SystemSettings; members: Member[]; tithes: Tithe[]; editRequests?: EditRequest[]; onBack: () => void; onAddTithe: (t: Tithe) => void; onUpdateTithe: (t: Tithe) => void; onDeleteTithe: (id: string) => void; isRestricted: boolean;
  permissions?: any;
  onRequestEdit: (screenId: string, recordId: string, whatToEdit: string, reason: string) => void;
}

export const TitheScreen: React.FC<TitheScreenProps> = ({ currentUser, translation, settings, members, tithes, editRequests = [], onBack, onAddTithe, onUpdateTithe, onDeleteTithe, isRestricted, permissions, onRequestEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTithe, setEditingTithe] = useState<Tithe | null>(null);
  const [viewingTithe, setViewingTithe] = useState<Tithe | null>(null);
  const [titheToDelete, setTitheToDelete] = useState<string | null>(null);
  const [requestingEdit, setRequestingEdit] = useState<Tithe | null>(null);
  const isLight = settings.theme === 'light';

  const getApprovedEditRequest = (recordId: string) => {
    return editRequests.find(r => 
      r.screenId === 'tithes' && 
      r.recordId === recordId && 
      r.requesterId === currentUser.id && 
      r.status === 'approved' && 
      r.expiresAt && new Date(r.expiresAt) > new Date()
    );
  };

  const hasApprovedEditRequest = (recordId: string) => !!getApprovedEditRequest(recordId);

  const filteredTithes = useMemo(() => {
    return tithes.filter(t => {
      const matchesSearch = t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
      // RESTRICCIONES ELIMINADAS: Se muestran todos los diezmos
      return matchesSearch;
    });
  }, [tithes, searchTerm]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2"><DollarSign className="text-emerald-500" /> {translation.tithes}</h2>
            <p className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Gestión de Diezmos</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"><Plus size={18} /><span className="hidden sm:inline font-bold text-sm">{translation.addTithe}</span></button>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300 group-focus-within:text-emerald-500' : 'text-white/20 group-focus-within:text-emerald-400'}`} />
          <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300' : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'}`} />
        </div>

        <div className="space-y-4">
          {filteredTithes.map((t) => (
            <div key={t.id} onClick={() => setViewingTithe(t)} className={`rounded-[32px] p-5 flex items-center justify-between group transition-all border cursor-pointer active:scale-[0.99] shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-emerald-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={t.memberPhoto} className={`w-14 h-14 rounded-2xl object-cover border-2 transition-all ${isLight ? 'border-slate-50 group-hover:border-emerald-200' : 'border-white/10 group-hover:border-emerald-500/50'}`} alt="Member" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`}><Check size={8} className="text-white" /></div>
                </div>
                <div>
                  <h4 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.memberName}</h4>
                  <div className="flex items-center gap-3 mt-1">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{t.id}</span>
                     <span className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{formatToMMDDYYYY(t.date)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-emerald-500">${t.amount.toLocaleString()}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 transition-colors ${isLight ? 'text-slate-300 group-hover:text-emerald-500' : 'text-white/20 group-hover:text-white/40'}`}><span className="text-[9px] uppercase font-bold tracking-tighter">{translation.details}</span><ArrowRight size={10} /></div>
              </div>
            </div>
          ))}
          {filteredTithes.length === 0 && (
            <div className="py-24 text-center opacity-20">
              <DollarSign size={64} className="mx-auto mb-4" />
              <p className="text-xl font-bold italic">No se encontraron registros</p>
            </div>
          )}
        </div>
      </div>

      {viewingTithe && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <div className="relative h-48 flex-shrink-0">
               <img src={viewingTithe.memberPhoto} className="w-full h-full object-cover" alt={viewingTithe.memberName} />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
               <button onClick={() => setViewingTithe(null)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"><X size={20} className="text-white"/></button>
               <div className="absolute bottom-6 left-6 right-6"><h3 className="text-2xl font-bold text-white">{viewingTithe.memberName}</h3><p className="text-emerald-400 font-black text-sm uppercase tracking-widest">{viewingTithe.id}</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
              {getApprovedEditRequest(viewingTithe.id) && (
                <EditCountdown 
                  expiresAt={getApprovedEditRequest(viewingTithe.id)!.expiresAt!} 
                  onExpire={() => setViewingTithe(null)} 
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className={`text-[10px] font-black uppercase mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Amount</p><p className="text-2xl font-black text-emerald-500">${viewingTithe.amount.toLocaleString()}</p></div>
                <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className={`text-[10px] font-black uppercase mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Date</p><p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatToMMDDYYYY(viewingTithe.date)}</p></div>
              </div>
            </div>
            <div className={`p-6 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
              {permissions?.canDelete && (
                <button onClick={() => { setTitheToDelete(viewingTithe.id); setViewingTithe(null); }} className="flex-1 py-4 font-bold text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">{translation.delete}</button>
              )}
              {permissions?.canEdit || hasApprovedEditRequest(viewingTithe.id) ? (
                <button onClick={() => { setEditingTithe(viewingTithe); setViewingTithe(null); }} className="flex-[2] py-4 bg-emerald-600 rounded-2xl font-bold text-white shadow-xl hover:bg-emerald-500 transition-all active:scale-95">{translation.edit}</button>
              ) : (
                <button onClick={() => { setRequestingEdit(viewingTithe); setViewingTithe(null); }} className="flex-[2] py-4 bg-amber-500 rounded-2xl font-bold text-white shadow-xl hover:bg-amber-400 transition-all active:scale-95">Request Edit</button>
              )}
            </div>
          </div>
        </div>
      )}

      {requestingEdit && (
        <EditRequestModal
          translation={translation}
          theme={settings.theme}
          moduleName="Diezmos"
          recordName={`Diezmo de ${requestingEdit.memberName} (${formatToMMDDYYYY(requestingEdit.date)})`}
          onClose={() => setRequestingEdit(null)}
          onSubmit={(whatToEdit, reason) => {
            onRequestEdit('tithes', requestingEdit.id, whatToEdit, reason);
            setRequestingEdit(null);
          }}
        />
      )}

      {titheToDelete && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col shadow-2xl border p-8 text-center ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <h3 className="text-xl font-black mb-4">Are you sure you want to delete this transaction?</h3>
            <p className={`text-sm mb-8 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setTitheToDelete(null)} className={`flex-1 py-4 font-bold rounded-2xl transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Cancel</button>
              <button onClick={() => { onDeleteTithe(titheToDelete); setTitheToDelete(null); }} className="flex-1 py-4 font-bold bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || editingTithe) && <TitheFormModal initialData={editingTithe || undefined} onClose={() => { setShowAddModal(false); setEditingTithe(null); }} members={members} isLight={isLight} translation={translation} currentUser={currentUser} onSave={(t) => { if (editingTithe) onUpdateTithe(t); else onAddTithe(t); setShowAddModal(false); setEditingTithe(null); }} />}
    </div>
  );
};
