
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit3, X, Search, Layers, Check, AlertCircle } from 'lucide-react';
import { Translation, SystemSettings } from '../types';

interface ExpenseCategoriesScreenProps {
  translation: Translation;
  settings: SystemSettings;
  categories: string[];
  onBack: () => void;
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
}

export const ExpenseCategoriesScreen: React.FC<ExpenseCategoriesScreenProps> = ({
  translation,
  settings,
  categories,
  onBack,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const isLight = settings.theme === 'light';

  const filteredCategories = categories.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (editingCategory && editText.trim()) {
      onUpdateCategory(editingCategory, editText.trim());
      setEditingCategory(null);
      setEditText('');
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth transition-colors duration-500 ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      
      {/* Dynamic Header */}
      <div className={`w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className={`p-2 rounded-full transition-all active:scale-90 ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight">{translation.expenseCategories}</h2>
            <p className={`text-[10px] uppercase font-black tracking-widest ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Catálogo de Egresos</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Modern Search Bar */}
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300 group-focus-within:text-orange-500' : 'text-white/20 group-focus-within:text-orange-400'}`} />
          <input 
            type="text" 
            placeholder="Buscar categorías..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full border rounded-[24px] py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300' : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'}`}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Animated Add Form */}
        {isAdding && (
          <div className={`rounded-[32px] p-6 mb-8 border animate-in slide-in-from-top-4 duration-300 shadow-xl ${isLight ? 'bg-white border-orange-200' : 'glass border-orange-500/30'}`}>
            <div className="flex flex-col gap-4">
              <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Category Name</label>
              <div className="flex items-center gap-3">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ej: Mantenimiento, Servicios..." 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  className={`flex-1 border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                />
                <button 
                  onClick={handleAdd}
                  className="p-3.5 bg-orange-600 text-white rounded-2xl shadow-xl active:scale-95 transition-all"
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className={`p-3.5 rounded-2xl transition-all ${isLight ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {filteredCategories.map((cat) => (
            <div 
              key={cat} 
              className={`rounded-[28px] p-5 flex items-center justify-between group border transition-all hover:shadow-lg ${isLight ? 'bg-white border-slate-100 hover:border-orange-200' : 'glass border-white/5 hover:bg-white/10 hover:border-orange-500/20'}`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${isLight ? 'bg-orange-50 text-orange-600' : 'bg-orange-500/10 text-orange-400'}`}>
                  <Layers size={22} />
                </div>
                
                <div className="flex-1 min-w-0 pr-4">
                  {editingCategory === cat ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editText} 
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                      className={`w-full border rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white'}`}
                    />
                  ) : (
                    <span className={`font-bold text-base truncate block ${isLight ? 'text-slate-800' : 'text-white/90'}`}>{cat}</span>
                  )}
                  <p className={`text-[9px] font-black uppercase tracking-widest opacity-30 mt-0.5`}>Tipo de Gasto</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {editingCategory === cat ? (
                  <button onClick={handleUpdate} className="p-2.5 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"><Check size={20} /></button>
                ) : (
                  <>
                    <button 
                      onClick={() => { setEditingCategory(cat); setEditText(cat); }}
                      className={`p-2.5 transition-all rounded-xl ${isLight ? 'text-slate-300 hover:text-slate-900 hover:bg-slate-100' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('Delete this category?')) onDeleteCategory(cat); }}
                      className={`p-2.5 transition-all rounded-xl ${isLight ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-white/20 hover:text-red-500 hover:bg-red-500/10'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="py-32 text-center opacity-20">
              <AlertCircle size={64} className="mx-auto mb-4" />
              <p className="text-xl font-bold italic">No se encontraron categorías</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
