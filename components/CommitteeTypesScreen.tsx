
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit3, X, Search, Layers, Check } from 'lucide-react';
import { Translation, SystemSettings } from '../types';

interface CommitteeTypesScreenProps {
  translation: Translation;
  settings: SystemSettings;
  types: string[];
  onBack: () => void;
  onAdd: (type: string) => void;
  onUpdate: (old: string, updated: string) => void;
  onDelete: (type: string) => void;
}

export const CommitteeTypesScreen: React.FC<CommitteeTypesScreenProps> = ({ 
  translation, settings, types, onBack, onAdd, onUpdate, onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const isLight = settings.theme === 'light';

  const filtered = (types || []).filter(t => 
    t && typeof t === 'string' && t.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSave = () => {
    if (!inputText.trim()) return;
    if (editingType) {
      onUpdate(editingType, inputText.trim());
      setEditingType(null);
    } else {
      onAdd(inputText.trim());
      setIsAdding(false);
    }
    setInputText('');
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-2xl mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold">{translation.committeeTypes}</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className="p-2 bg-indigo-600 rounded-full text-white shadow-lg active:scale-95 transition-all"><Plus size={24} /></button>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input 
            type="text" 
            placeholder="Buscar tipo de comité..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
          />
        </div>

        {(isAdding || editingType) && (
          <div className={`rounded-[32px] p-6 mb-8 border animate-in slide-in-from-top-4 ${isLight ? 'bg-white border-indigo-100 shadow-xl' : 'glass border-indigo-500/30'}`}>
            <div className="flex items-center gap-4">
              <input 
                autoFocus 
                type="text" 
                placeholder="Type name..." 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className={`flex-1 border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`} 
              />
              <button onClick={handleSave} className="p-3 bg-indigo-600 rounded-2xl text-white"><Check size={20} /></button>
              <button onClick={() => { setIsAdding(false); setEditingType(null); setInputText(''); }} className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-white/40'}`}><X size={20} /></button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((type) => (
            <div key={type} className={`rounded-[28px] p-6 flex items-center justify-between border transition-all ${isLight ? 'bg-white border-slate-100 shadow-sm hover:border-indigo-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/20 text-indigo-500'}`}><Layers size={20} /></div>
                {editingType === type ? (
                  <input autoFocus type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} className={`flex-1 border rounded-xl px-4 py-1 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white'}`} />
                ) : ( <span className="font-semibold">{type}</span> )}
              </div>
              <div className="flex gap-2">
                {editingType === type ? (
                  <button onClick={handleSave} className="p-2 text-blue-500"><Check size={18} /></button>
                ) : (
                  <>
                    <button onClick={() => { setEditingType(type); setInputText(type); }} className={`p-2 transition-colors ${isLight ? 'text-slate-300 hover:text-indigo-900' : 'text-white/20 hover:text-white'}`}><Edit3 size={18} /></button>
                    <button onClick={() => { if(confirm(translation.confirmAction)) onDelete(type); }} className={`p-2 transition-colors ${isLight ? 'text-slate-300 hover:text-red-500' : 'text-white/20 hover:text-red-500'}`}><Trash2 size={18} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-24 text-center opacity-20">
              <Layers size={64} className="mx-auto mb-4" />
              <p className="text-xl font-bold italic">No se encontraron tipos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
