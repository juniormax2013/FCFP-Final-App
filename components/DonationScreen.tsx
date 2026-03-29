
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, HeartHandshake, X, Check, Trash2, Edit3, History, Calendar, ArrowRight, User as UserIcon } from 'lucide-react';
import { User, Translation, Donation, DonationAudit, SystemSettings, ModulePermission, EditRequest } from '../types';
import { formatToMMDDYYYY } from '../lib/utils';
import { EditRequestModal } from './EditRequestModal';
import { EditCountdown } from './EditCountdown';

interface DonationFormModalProps {
  initialData?: Donation; onClose: () => void; onSave: (d: Donation) => void; translation: Translation; currentUser: User; isLight: boolean;
}

const DonationFormModal: React.FC<DonationFormModalProps> = ({ initialData, onClose, onSave, translation, currentUser, isLight }) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [donorName, setDonorName] = useState(initialData?.donorName || '');
  const [purpose, setPurpose] = useState(initialData?.purpose || 'Misiones');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const numAmount = Number(amount);
    const timestamp = new Date().toISOString();
    if (initialData) {
      onSave({ ...initialData, amount: numAmount, donorName, purpose, notes, audits: [{ id: Date.now().toString(), userId: currentUser.id, userName: currentUser.firstName, action: 'update', timestamp }, ...initialData.audits] });
    } else {
      onSave({ id: `D-${Date.now().toString().slice(-6)}`, amount: numAmount, donorName, purpose, date: timestamp, registeredBy: currentUser.firstName, registeredById: currentUser.id, notes, audits: [{ id: Date.now().toString(), userId: currentUser.id, userName: currentUser.firstName, action: 'create', timestamp }], updatedAt: timestamp });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2"><HeartHandshake className="text-rose-500" />{initialData ? translation.edit : translation.addDonation}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full border rounded-3xl py-4 px-6 text-3xl font-black focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
          <input type="text" placeholder="Donor name..." value={donorName} onChange={e => setDonorName(e.target.value)} className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>
        <div className="p-6 sm:p-8 flex gap-4 border-t border-white/5">
           <button onClick={onClose} className="flex-1 py-4 font-bold">{translation.cancel}</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-rose-600 rounded-3xl font-bold text-white shadow-xl">{translation.save}</button>
        </div>
      </div>
    </div>
  );
};

interface DonationScreenProps {
  currentUser: User; translation: Translation; donations: Donation[]; editRequests?: EditRequest[]; settings: SystemSettings; onBack: () => void; onAddDonation: (d: Donation) => void; onUpdateDonation: (d: Donation) => void; onDeleteDonation: (id: string) => void;
  permissions: ModulePermission | undefined;
  onRequestEdit: (screenId: string, recordId: string, whatToEdit: string, reason: string) => void;
}

export const DonationScreen: React.FC<DonationScreenProps> = ({ currentUser, translation, donations, editRequests = [], settings, onBack, onAddDonation, onUpdateDonation, onDeleteDonation, permissions, onRequestEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [viewingDonation, setViewingDonation] = useState<Donation | null>(null);
  const [requestingEdit, setRequestingEdit] = useState<Donation | null>(null);
  const isLight = settings.theme === 'light';

  const getApprovedEditRequest = (recordId: string) => {
    return editRequests.find(r => 
      r.screenId === 'donations' && 
      r.recordId === recordId && 
      r.requesterId === currentUser.id && 
      r.status === 'approved' && 
      r.expiresAt && new Date(r.expiresAt) > new Date()
    );
  };

  const hasApprovedEditRequest = (recordId: string) => !!getApprovedEditRequest(recordId);

  const filteredDonations = donations.filter(d => (d.donorName || '').toLowerCase().includes(searchTerm.toLowerCase()) || d.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md border-b border-white/5`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5"><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold tracking-tight">{translation.donations}</h2>
        </div>
        {permissions?.canCreate && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"><Plus size={18} /> <span className="hidden sm:inline font-bold text-sm">{translation.addDonation}</span></button>
        )}
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 gap-4">
          {filteredDonations.map((d) => (
            <div key={d.id} onClick={() => setViewingDonation(d)} className={`rounded-[32px] p-6 flex items-center justify-between group transition-all border shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-rose-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500`}><HeartHandshake size={24} /></div>
                <div><h4 className="font-bold text-base">{d.donorName || 'Anónimo'}</h4><p className="text-[10px] uppercase font-black opacity-40">{d.purpose} • {formatToMMDDYYYY(d.date)}</p></div>
              </div>
              <p className="text-xl font-black text-rose-500">${d.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
      
      {viewingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md">
           <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col border shadow-2xl ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
              <div className="p-8 flex items-start justify-between border-b border-white/5"><h3 className="text-2xl font-black">Detalle</h3><button onClick={() => setViewingDonation(null)}><X size={24}/></button></div>
              <div className="p-8 space-y-6">
                {getApprovedEditRequest(viewingDonation.id) && (
                  <EditCountdown 
                    expiresAt={getApprovedEditRequest(viewingDonation.id)!.expiresAt!} 
                    onExpire={() => setViewingDonation(null)} 
                  />
                )}
                 <p className="text-4xl font-black text-rose-500">${viewingDonation.amount.toLocaleString()}</p>
              </div>
              <div className="p-6 flex gap-4 border-t border-white/5">
                {permissions?.canDelete && <button onClick={() => { onDeleteDonation(viewingDonation.id); setViewingDonation(null); }} className="flex-1 py-4 font-bold text-red-500">Delete</button>}
                {permissions?.canEdit || hasApprovedEditRequest(viewingDonation.id) ? (
                  <button onClick={() => { setEditingDonation(viewingDonation); setViewingDonation(null); }} className="flex-[2] py-4 bg-rose-600 rounded-2xl font-bold text-white">Edit</button>
                ) : (
                  <button onClick={() => { setRequestingEdit(viewingDonation); setViewingDonation(null); }} className="flex-[2] py-4 bg-amber-500 rounded-2xl font-bold text-white shadow-xl hover:bg-amber-400 transition-all active:scale-95">Request Edit</button>
                )}
              </div>
           </div>
        </div>
      )}

      {requestingEdit && (
        <EditRequestModal
          translation={translation}
          theme={settings.theme}
          moduleName="Donaciones"
          recordName={`Donación de ${requestingEdit.donorName || 'Anónimo'} (${formatToMMDDYYYY(requestingEdit.date)})`}
          onClose={() => setRequestingEdit(null)}
          onSubmit={(whatToEdit, reason) => {
            onRequestEdit('donations', requestingEdit.id, whatToEdit, reason);
            setRequestingEdit(null);
          }}
        />
      )}

      {(showAddModal || editingDonation) && <DonationFormModal isLight={isLight} initialData={editingDonation || undefined} onClose={() => { setShowAddModal(false); setEditingDonation(null); }} translation={translation} currentUser={currentUser} onSave={(d) => { if (editingDonation) onUpdateDonation(d); else onAddDonation(d); setShowAddModal(false); setEditingDonation(null); }} />}
    </div>
  );
};
