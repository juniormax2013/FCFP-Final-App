
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Wallet, X, Check, Trash2, Edit3, History, Calendar, ArrowRight, User as UserIcon } from 'lucide-react';
import { User, Translation, Offering, OfferingAudit, SystemSettings, EditRequest } from '../types';
import { formatToMMDDYYYY } from '@/lib/utils';
import { EditRequestModal } from './EditRequestModal';
import { EditCountdown } from './EditCountdown';

interface OfferingFormModalProps {
  initialData?: Offering;
  onClose: () => void;
  onSave: (o: Offering) => void;
  translation: Translation;
  currentUser: User;
  isLight: boolean;
}

const OfferingFormModal: React.FC<OfferingFormModalProps> = ({ 
  initialData, onClose, onSave, translation, currentUser, isLight
}) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [type, setType] = useState(initialData?.type || 'General');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { alert("Enter a valid amount."); return; }
    const numAmount = Number(amount);
    const timestamp = new Date().toISOString();

    if (initialData) {
      const audit: OfferingAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'update', timestamp };
      onSave({ ...initialData, amount: numAmount, type, notes, audits: [audit, ...initialData.audits] });
    } else {
      const audit: OfferingAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'create', timestamp };
      onSave({ id: `O-${Date.now().toString().slice(-6)}`, amount: numAmount, type, date: timestamp, registeredBy: `${currentUser.firstName} ${currentUser.lastName}`, registeredById: currentUser.id, notes, audits: [audit], updatedAt: timestamp });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}><Wallet size={20} className="text-indigo-500" />{initialData ? translation.edit : translation.addOffering}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.moneyAmount}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-xl">$</span>
              <input type="number" autoFocus placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-3xl font-black focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Offering Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all appearance-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}>
              <option value="General">General</option><option value="Misiones">Misiones</option><option value="Construcción">Construcción</option><option value="Social">Ayuda Social</option><option value="Zelle">Zelle</option><option value="Especial">Especial / Otros</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detalles de la ofrenda..." className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none min-h-[100px] transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
          </div>
        </div>
        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
           <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{translation.cancel}</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-indigo-600 rounded-3xl font-bold text-white shadow-xl active:scale-95 transition-all">{translation.save}</button>
        </div>
      </div>
    </div>
  );
};

interface OfferingScreenProps {
  currentUser: User; translation: Translation; offerings: Offering[]; editRequests?: EditRequest[]; settings: SystemSettings; onBack: () => void; onAddOffering: (o: Offering) => void; onUpdateOffering: (o: Offering) => void; onDeleteOffering: (id: string) => void;
  permissions?: any;
  onRequestEdit: (screenId: string, recordId: string, whatToEdit: string, reason: string) => void;
}

export const OfferingScreen: React.FC<OfferingScreenProps> = ({
  currentUser, translation, offerings, editRequests = [], settings, onBack, onAddOffering, onUpdateOffering, onDeleteOffering, permissions, onRequestEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [viewingOffering, setViewingOffering] = useState<Offering | null>(null);
  const [requestingEdit, setRequestingEdit] = useState<Offering | null>(null);
  const isLight = settings.theme === 'light';
  const isAdmin = currentUser.role === 'admin' || currentUser.id === '1' || currentUser.role === 'secretaria' || currentUser.role === 'contable';

  const getApprovedEditRequest = (recordId: string) => {
    return editRequests.find(r => 
      r.screenId === 'offerings' && 
      r.recordId === recordId && 
      r.requesterId === currentUser.id && 
      r.status === 'approved' && 
      r.expiresAt && new Date(r.expiresAt) > new Date()
    );
  };

  const hasApprovedEditRequest = (recordId: string) => !!getApprovedEditRequest(recordId);

  const filteredOfferings = useMemo(() => offerings.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.type?.toLowerCase().includes(searchTerm.toLowerCase())), [offerings, searchTerm]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold tracking-tight">{translation.offerings}</h2>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"><Plus size={18} /> <span className="hidden sm:inline font-bold text-sm">{translation.addOffering}</span></button>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input type="text" placeholder="Buscar ofrendas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredOfferings.map((o) => (
            <div key={o.id} onClick={() => setViewingOffering(o)} className={`rounded-[32px] p-6 flex items-center justify-between group transition-all border cursor-pointer active:scale-[0.99] shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-indigo-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}><Wallet size={24} /></div>
                <div>
                  <h4 className="font-bold text-base">Ofrenda {o.type}</h4>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{o.id} • {formatToMMDDYYYY(o.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-indigo-500">${o.amount.toLocaleString()}</p>
                <ArrowRight size={14} className={`${isLight ? 'text-slate-200' : 'text-white/10'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {(showAddModal || editingOffering) && <OfferingFormModal isLight={isLight} initialData={editingOffering || undefined} onClose={() => { setShowAddModal(false); setEditingOffering(null); }} translation={translation} currentUser={currentUser} onSave={(o) => { if (editingOffering) onUpdateOffering(o); else onAddOffering(o); setShowAddModal(false); setEditingOffering(null); }} />}
      {viewingOffering && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
           <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
              <div className={`p-8 flex items-start justify-between border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                 <h3 className="text-2xl font-black">Detalle de Ofrenda</h3>
                 <button onClick={() => setViewingOffering(null)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {getApprovedEditRequest(viewingOffering.id) && (
                  <EditCountdown 
                    expiresAt={getApprovedEditRequest(viewingOffering.id)!.expiresAt!} 
                    onExpire={() => setViewingOffering(null)} 
                  />
                )}
                 <div className={`p-6 rounded-[32px] text-center border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">Registered Amount</p>
                    <p className="text-4xl font-black text-indigo-500">${viewingOffering.amount.toLocaleString()}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className="text-[9px] opacity-40 font-black uppercase">Type</p><p className="font-bold">{viewingOffering.type}</p></div>
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className="text-[9px] opacity-40 font-black uppercase">Date</p><p className="font-bold">{formatToMMDDYYYY(viewingOffering.date)}</p></div>
                 </div>
              </div>
              <div className={`p-6 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                {permissions?.canDelete && (
                  <button onClick={() => { onDeleteOffering(viewingOffering.id); setViewingOffering(null); }} className="flex-1 py-4 font-bold text-red-500">{translation.delete}</button>
                )}
                {permissions?.canEdit || hasApprovedEditRequest(viewingOffering.id) ? (
                  <button onClick={() => { setEditingOffering(viewingOffering); setViewingOffering(null); }} className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-xl">{translation.edit}</button>
                ) : (
                  <button onClick={() => { setRequestingEdit(viewingOffering); setViewingOffering(null); }} className="flex-[2] py-4 bg-amber-500 rounded-2xl font-bold text-white shadow-xl hover:bg-amber-400 transition-all active:scale-95">Request Edit</button>
                )}
              </div>
           </div>
        </div>
      )}

      {requestingEdit && (
        <EditRequestModal
          translation={translation}
          theme={settings.theme}
          moduleName="Ofrendas"
          recordName={`Ofrenda ${requestingEdit.type} (${formatToMMDDYYYY(requestingEdit.date)})`}
          onClose={() => setRequestingEdit(null)}
          onSubmit={(whatToEdit, reason) => {
            onRequestEdit('offerings', requestingEdit.id, whatToEdit, reason);
            setRequestingEdit(null);
          }}
        />
      )}
    </div>
  );
};
