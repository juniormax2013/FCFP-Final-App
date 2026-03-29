
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit3, X, Search, UserCheck, Check, Info, LayoutPanelTop } from 'lucide-react';
import { Translation, SystemSettings, CommitteeRole } from '../types';

interface CommitteeRolesScreenProps {
  translation: Translation;
  settings: SystemSettings;
  roles: CommitteeRole[];
  onBack: () => void;
  onAdd: (role: CommitteeRole) => void;
  onUpdate: (role: CommitteeRole) => void;
  onDelete: (id: string) => void;
}

export const CommitteeRolesScreen: React.FC<CommitteeRolesScreenProps> = ({ 
  translation, settings, roles, onBack, onAdd, onUpdate, onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState<CommitteeRole | null>(null);
  
  const [formData, setFormData] = useState<Partial<CommitteeRole>>({ name: '', description: '' });
  const isLight = settings.theme === 'light';

  const filtered = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (!formData.name?.trim()) return;
    if (editingRole) {
      onUpdate({ ...editingRole, name: formData.name, description: formData.description || '' });
      setEditingRole(null);
    } else {
      onAdd({ id: Date.now().toString(), name: formData.name, description: formData.description || '' });
      setIsAdding(false);
    }
    setFormData({ name: '', description: '' });
  };

  const startEdit = (r: CommitteeRole) => {
    setEditingRole(r);
    setFormData({ name: r.name, description: r.description });
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-3xl mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold">{translation.committeeRoles}</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className="p-2 bg-blue-600 rounded-full text-white shadow-lg active:scale-95 transition-all"><Plus size={24} /></button>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input 
            type="text" 
            placeholder="Buscar cargo o función..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
          />
        </div>

        {(isAdding || editingRole) && (
          <div className={`rounded-[32px] p-6 sm:p-8 mb-8 border animate-in slide-in-from-top-4 shadow-xl ${isLight ? 'bg-white border-blue-100' : 'glass-dark border-blue-500/30'}`}>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-blue-500">{editingRole ? translation.edit : translation.addRole}</h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Role Name</label>
                <input 
                  autoFocus 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Descripción de Funciones</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none min-h-[120px] ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`} 
                  placeholder="Explique qué responsabilidades conlleva este puesto..."
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setIsAdding(false); setEditingRole(null); }} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.cancel}</button>
                <button onClick={handleSave} className="flex-[2] py-4 bg-blue-600 rounded-2xl text-white font-bold shadow-lg active:scale-95 transition-all">{translation.save}</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((role) => (
            <div key={role.id} className={`rounded-[32px] p-6 border transition-all ${isLight ? 'bg-white border-slate-100 shadow-sm hover:border-blue-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}><UserCheck size={24} /></div>
                  <h4 className="font-bold text-lg">{role.name}</h4>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(role)} className={`p-2 transition-colors ${isLight ? 'text-slate-300 hover:text-blue-500' : 'text-white/20 hover:text-blue-400'}`}><Edit3 size={18} /></button>
                  <button onClick={() => { if(confirm('Delete role?')) onDelete(role.id); }} className={`p-2 transition-colors ${isLight ? 'text-slate-300 hover:text-red-500' : 'text-white/20 hover:text-red-500'}`}><Trash2 size={18} /></button>
                </div>
              </div>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${isLight ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white/5 border-white/5 text-white/50'}`}>
                <div className="flex gap-2 mb-2">
                  <Info size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="font-black uppercase tracking-[0.1em] text-[10px] text-blue-500">Función del Puesto</p>
                </div>
                {role.description || 'Sin descripción asignada.'}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-24 text-center opacity-20">
              <LayoutPanelTop size={64} className="mx-auto mb-4" />
              <p className="text-xl font-bold italic">No se encontraron cargos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
