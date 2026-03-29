
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit3, X, Search, MessageCircle, Check } from 'lucide-react';
import { Translation, SystemSettings } from '../types';

interface MemberLanguagesScreenProps {
  translation: Translation; settings: SystemSettings; languages: string[]; onBack: () => void; onAddLanguage: (l: string) => void; onUpdateLanguage: (old: string, updated: string) => void; onDeleteLanguage: (l: string) => void;
}

export const MemberLanguagesScreen: React.FC<MemberLanguagesScreenProps> = ({ translation, settings, languages, onBack, onAddLanguage, onUpdateLanguage, onDeleteLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newVal, setNewVal] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const isLight = settings.theme === 'light';

  const filtered = (languages || []).filter(l => 
    l && typeof l === 'string' && l.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleAdd = () => { if (newVal.trim()) { onAddLanguage(newVal.trim()); setNewVal(''); setIsAdding(false); } };
  const handleUpdate = () => { if (editing && editText.trim()) { onUpdateLanguage(editing, editText.trim()); setEditing(null); setEditText(''); } };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-2xl mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold">{translation.languages}</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className="p-2 bg-teal-500 rounded-full text-white shadow-lg active:scale-95 transition-all"><Plus size={24} /></button>
      </div>
      <div className="w-full max-w-2xl mx-auto px-4 mt-4">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input type="text" placeholder={`${translation.all}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
        </div>
        {isAdding && (
          <div className={`rounded-[32px] p-6 mb-8 border animate-in slide-in-from-top-4 ${isLight ? 'bg-white border-teal-200 shadow-xl' : 'glass border-teal-500/30'}`}>
            <div className="flex items-center gap-4">
              <input autoFocus type="text" placeholder={translation.languages} value={newVal} onChange={e => setNewVal(e.target.value)} className={`flex-1 border rounded-2xl px-4 py-3 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} />
              <button onClick={handleAdd} className="p-3 bg-teal-500 rounded-2xl text-white"><Check size={20} /></button>
              <button onClick={() => setIsAdding(false)} className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-white/40'}`}><X size={20} /></button>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item} className={`rounded-[28px] p-6 flex items-center justify-between border transition-all ${isLight ? 'bg-white border-slate-100 shadow-sm hover:border-teal-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-teal-50 text-teal-600' : 'bg-teal-500/20 text-teal-500'}`}><MessageCircle size={20} /></div>
                {editing === item ? (
                  <input autoFocus type="text" value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdate()} className={`flex-1 border rounded-xl px-4 py-1 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white'}`} />
                ) : ( <span className="font-semibold">{item}</span> )}
              </div>
              <div className="flex gap-2">
                {editing === item ? <button onClick={handleUpdate} className="p-2 text-blue-500"><Check size={18} /></button> : 
                <><button onClick={() => { setEditing(item); setEditText(item); }} className={`p-2 ${isLight ? 'text-slate-300 hover:text-slate-900' : 'text-white/20 hover:text-white'}`}><Edit3 size={18} /></button><button onClick={() => { if(confirm(translation.confirmAction)) onDeleteLanguage(item); }} className={`p-2 ${isLight ? 'text-slate-300 hover:text-red-500' : 'text-white/20 hover:text-red-500'}`}><Trash2 size={18} /></button></>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
