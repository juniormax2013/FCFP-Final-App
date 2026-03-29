
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, ReceiptText, X, Check, Trash2, Edit3, History, Calendar, ArrowRight, User as UserIcon, Tag, Info } from 'lucide-react';
import { User, Translation, Expense, ExpenseAudit, SystemSettings, EditRequest } from '../types';
import { formatToMMDDYYYY } from '../lib/utils';
import { EditRequestModal } from './EditRequestModal';
import { EditCountdown } from './EditCountdown';

interface ExpenseFormModalProps {
  initialData?: Expense; onClose: () => void; onSave: (e: Expense) => void; translation: Translation; currentUser: User; categories: string[]; isLight: boolean;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ 
  initialData, onClose, onSave, translation, currentUser, categories, isLight
}) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || categories[0] || 'Otros');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { alert("Enter a valid amount."); return; }
    if (!description.trim()) { alert("Ingrese una descripción."); return; }
    const timestamp = new Date().toISOString();
    if (initialData) {
      const audit: ExpenseAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'update', timestamp };
      onSave({ ...initialData, amount: Number(amount), category, description, audits: [audit, ...initialData.audits] });
    } else {
      const audit: ExpenseAudit = { id: Date.now().toString(), userId: currentUser.id, userName: `${currentUser.firstName} ${currentUser.lastName}`, action: 'create', timestamp };
      onSave({ id: `G-${Date.now().toString().slice(-6)}`, amount: Number(amount), category, description, date: timestamp, registeredBy: `${currentUser.firstName} ${currentUser.lastName}`, registeredById: currentUser.id, audits: [audit], updatedAt: timestamp });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}><ReceiptText size={20} className="text-orange-500" />{initialData ? translation.edit : translation.addExpense}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-xl">$</span>
              <input type="number" autoFocus placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-3xl font-black focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all appearance-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="¿En qué se usó el dinero?..." className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none min-h-[100px] transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
          </div>
        </div>
        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
           <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{translation.cancel}</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-orange-600 rounded-3xl font-bold text-white shadow-xl active:scale-95 transition-all">{translation.save}</button>
        </div>
      </div>
    </div>
  );
};

interface ExpenseScreenProps {
  currentUser: User; translation: Translation; expenses: Expense[]; editRequests?: EditRequest[]; categories: string[]; settings: SystemSettings; onBack: () => void; onAddExpense: (e: Expense) => void; onUpdateExpense: (e: Expense) => void; onDeleteExpense: (id: string) => void; permissions?: { canCreate: boolean; canEdit: boolean; canDelete: boolean; };
  onRequestEdit: (screenId: string, recordId: string, whatToEdit: string, reason: string) => void;
}

export const ExpenseScreen: React.FC<ExpenseScreenProps> = ({
  currentUser, translation, expenses, editRequests = [], categories, settings, onBack, onAddExpense, onUpdateExpense, onDeleteExpense, permissions, onRequestEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [requestingEdit, setRequestingEdit] = useState<Expense | null>(null);
  const isLight = settings.theme === 'light';

  const getApprovedEditRequest = (recordId: string) => {
    return editRequests.find(r => 
      r.screenId === 'expenses' && 
      r.recordId === recordId && 
      r.requesterId === currentUser.id && 
      r.status === 'approved' && 
      r.expiresAt && new Date(r.expiresAt) > new Date()
    );
  };

  const hasApprovedEditRequest = (recordId: string) => !!getApprovedEditRequest(recordId);

  const filteredExpenses = useMemo(() => expenses.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase())), [expenses, searchTerm]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold tracking-tight">{translation.expenses}</h2>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"><Plus size={18} /> <span className="hidden sm:inline font-bold text-sm">{translation.addExpense}</span></button>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input type="text" placeholder="Buscar gastos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredExpenses.map((e) => (
            <div key={e.id} onClick={() => setViewingExpense(e)} className={`rounded-[32px] p-6 flex items-center justify-between group transition-all border cursor-pointer active:scale-[0.99] shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-orange-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isLight ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}><ReceiptText size={24} /></div>
                <div>
                  <h4 className="font-bold text-base line-clamp-1">{e.description}</h4>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{e.category} • {formatToMMDDYYYY(e.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-orange-500">${e.amount.toLocaleString()}</p>
                <ArrowRight size={14} className={`${isLight ? 'text-slate-200' : 'text-white/10'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewingExpense && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}><ReceiptText size={20} className="text-orange-500" />Expense Details</h3>
              <button onClick={() => setViewingExpense(null)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
              {getApprovedEditRequest(viewingExpense.id) && (
                <EditCountdown 
                  expiresAt={getApprovedEditRequest(viewingExpense.id)!.expiresAt!} 
                  onExpire={() => setViewingExpense(null)} 
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className={`text-[10px] font-black uppercase mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Amount</p><p className="text-2xl font-black text-orange-500">${viewingExpense.amount.toLocaleString()}</p></div>
                <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}><p className={`text-[10px] font-black uppercase mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Date</p><p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatToMMDDYYYY(viewingExpense.date)}</p></div>
              </div>
              <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <p className={`text-[10px] font-black uppercase mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Category</p>
                <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{viewingExpense.category}</p>
              </div>
              <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <p className={`text-[10px] font-black uppercase mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Description</p>
                <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{viewingExpense.description}</p>
              </div>
            </div>
            <div className={`p-6 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
              {permissions?.canDelete && (
                <button onClick={() => { setExpenseToDelete(viewingExpense.id); setViewingExpense(null); }} className="flex-1 py-4 font-bold text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">{translation.delete}</button>
              )}
              {permissions?.canEdit || hasApprovedEditRequest(viewingExpense.id) ? (
                <button onClick={() => { setEditingExpense(viewingExpense); setViewingExpense(null); }} className="flex-[2] py-4 bg-orange-600 rounded-2xl font-bold text-white shadow-xl hover:bg-orange-500 transition-all active:scale-95">{translation.edit}</button>
              ) : (
                <button onClick={() => { setRequestingEdit(viewingExpense); setViewingExpense(null); }} className="flex-[2] py-4 bg-amber-500 rounded-2xl font-bold text-white shadow-xl hover:bg-amber-400 transition-all active:scale-95">Request Edit</button>
              )}
            </div>
          </div>
        </div>
      )}

      {requestingEdit && (
        <EditRequestModal
          translation={translation}
          theme={settings.theme}
          moduleName="Gastos"
          recordName={`Gasto de ${requestingEdit.category} (${formatToMMDDYYYY(requestingEdit.date)})`}
          onClose={() => setRequestingEdit(null)}
          onSubmit={(whatToEdit, reason) => {
            onRequestEdit('expenses', requestingEdit.id, whatToEdit, reason);
            setRequestingEdit(null);
          }}
        />
      )}

      {expenseToDelete && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col shadow-2xl border p-8 text-center ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <h3 className="text-xl font-black mb-4">Are you sure you want to delete this transaction?</h3>
            <p className={`text-sm mb-8 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setExpenseToDelete(null)} className={`flex-1 py-4 font-bold rounded-2xl transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Cancel</button>
              <button onClick={() => { onDeleteExpense(expenseToDelete); setExpenseToDelete(null); }} className="flex-1 py-4 font-bold bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || editingExpense) && <ExpenseFormModal isLight={isLight} categories={categories} initialData={editingExpense || undefined} onClose={() => { setShowAddModal(false); setEditingExpense(null); }} translation={translation} currentUser={currentUser} onSave={(e) => { if (editingExpense) onUpdateExpense(e); else onAddExpense(e); setShowAddModal(false); setEditingExpense(null); }} />}
    </div>
  );
};
