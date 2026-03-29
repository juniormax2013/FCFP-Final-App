
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit3, X, Search, Heart, Check } from 'lucide-react';
import { Translation, SystemSettings } from '../types';

interface CivilStatusScreenProps {
  translation: Translation; settings: SystemSettings; statuses: string[]; onBack: () => void; onAddStatus: (status: string) => void; onUpdateStatus: (oldStatus: string, newStatus: string) => void; onDeleteStatus: (status: string) => void;
}

export const CivilStatusScreen: React.FC<CivilStatusScreenProps> = ({ translation, settings, statuses, onBack, onAddStatus, onUpdateStatus, onDeleteStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const isLight = settings.theme === 'light';

  const filtered = (statuses || []).filter(s => 
    s && typeof s === 'string' && s.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleAdd = () => { if (newStatus.trim()) { onAddStatus(newStatus.trim()); setNewStatus(''); setIsAdding(false); } };
  const handleUpdate = () => { if (editingStatus && editText.trim()) { onUpdateStatus(editingStatus, editText.trim()); setEditingStatus(null); setEditText(''); } };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-2xl mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold tracking-tight">{translation.civilStatus}</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className="p-2 bg-rose-500 rounded-full text-white shadow-lg active:scale-95 transition-all"><Plus size={24} /></button>
      </div>
      <div className="w-full max-w-2xl mx-auto px-4 mt-4">
        <div className="relative mb-8">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input type="text" placeholder={`${translation.all}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>
        {isAdding && (
          <div className={`rounded-[32px] p-6 mb-8 border animate-in slide-in-from-top-4 ${isLight ? 'bg-white border-rose-200 shadow-xl' : 'glass border-rose-500/30'}`}>
            <div className="flex items-center gap-4">
              <input autoFocus type="text" placeholder={translation.civilStatus} value={newStatus} onChange={e => setNewStatus(e.target.value)} className={`flex-1 border rounded-2xl px-4 py-3 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
              <button onClick={handleAdd} className="p-3 bg-rose-500 rounded-2xl text-white"><Check size={20} /></button>
              <button onClick={() => setIsAdding(false)} className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-white/40'}`}><X size={20} /></button>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {filtered.map((status) => (
            <div key={status} className={`rounded-[28px] p-6 flex items-center justify-between border transition-all ${isLight ? 'bg-white border-slate-100 shadow-sm hover:border-rose-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-rose-50 text-rose-500' : 'bg-rose-500/20 text-rose-500'}`}><Heart size={20} /></div>
                {editingStatus === status ? (
                  <input autoFocus type="text" value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdate()} className={`flex-1 border rounded-xl px-4 py-1 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white'}`} />
                ) : ( <span className="font-semibold">{status}</span> )}
              </div>
              <div className="flex gap-2">
                {editingStatus === status ? <button onClick={handleUpdate} className="p-2 text-blue-500"><Check size={18} /></button> : 
                <><button onClick={() => { setEditingStatus(status); setEditText(status); }} className={`p-2 ${isLight ? 'text-slate-300 hover:text-slate-900' : 'text-white/20 hover:text-white'}`}><Edit3 size={18} /></button><button onClick={() => { if(confirm(translation.confirmAction)) onDeleteStatus(status); }} className={`p-2 ${isLight ? 'text-slate-300 hover:text-red-500' : 'text-white/20 hover:text-red-500'}`}><Trash2 size={18} /></button></>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
