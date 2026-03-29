import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import { SystemModule, User, Translation, ThemeMode } from '../types';

interface ModulesScreenProps {
  modules: SystemModule[];
  users: User[];
  roles: string[];
  translation: Translation;
  theme: ThemeMode;
  onAdd: (module: Omit<SystemModule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, module: Partial<SystemModule>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const AVAILABLE_SCREENS = [
  { id: 'members', name: 'Members' },
  { id: 'activities', name: 'Activities' },
  { id: 'tithes', name: 'Tithes' },
  { id: 'offerings', name: 'Offerings' },
  { id: 'donations', name: 'Donations' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'prayers', name: 'Prayers' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'birthdays', name: 'Birthdays' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'committee', name: 'Committee' },
  { id: 'attendance', name: 'Attendance' },
  { id: 'sunday_school', name: 'Sunday School' }
];

export const ModulesScreen: React.FC<ModulesScreenProps> = ({
  modules, users, roles, translation, theme, onAdd, onUpdate, onDelete, onBack
}) => {
  const isLight = theme === 'light';
  const [isEditing, setIsEditing] = useState(false);
  const [currentModule, setCurrentModule] = useState<Partial<SystemModule>>({});

  const handleSave = () => {
    if (!currentModule.name || !currentModule.responsibleId) return;
    
    if (currentModule.id) {
      onUpdate(currentModule.id, currentModule);
    } else {
      onAdd({
        name: currentModule.name,
        image: currentModule.image || null,
        screens: currentModule.screens || [],
        roles: currentModule.roles || [],
        responsibleId: currentModule.responsibleId
      });
    }
    setIsEditing(false);
    setCurrentModule({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentModule(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleScreen = (screenId: string) => {
    const screens = currentModule.screens || [];
    if (screens.includes(screenId)) {
      setCurrentModule(prev => ({ ...prev, screens: screens.filter(s => s !== screenId) }));
    } else {
      setCurrentModule(prev => ({ ...prev, screens: [...screens, screenId] }));
    }
  };

  const toggleRole = (role: string) => {
    const moduleRoles = currentModule.roles || [];
    if (moduleRoles.includes(role)) {
      setCurrentModule(prev => ({ ...prev, roles: moduleRoles.filter(r => r !== role) }));
    } else {
      setCurrentModule(prev => ({ ...prev, roles: [...moduleRoles, role] }));
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0a0a] text-white'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-indigo-500" />
                Module Management
              </h1>
            </div>
            {!isEditing && (
              <button
                onClick={() => { setCurrentModule({}); setIsEditing(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Module</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <div className={`max-w-2xl mx-auto rounded-3xl border p-6 sm:p-8 shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{currentModule.id ? 'Edit Module' : 'New Module'}</h2>
              <button onClick={() => setIsEditing(false)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image */}
              <div className="flex flex-col items-center gap-4">
                <label className={`relative w-24 h-24 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed ${isLight ? 'border-slate-300 hover:border-indigo-500 bg-slate-50' : 'border-white/20 hover:border-indigo-500 bg-white/5'}`}>
                  {currentModule.image ? (
                    <img src={currentModule.image} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="opacity-50" size={32} />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                <span className="text-xs opacity-60">Module Logo</span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Module Name</label>
                <input
                  type="text"
                  value={currentModule.name || ''}
                  onChange={e => setCurrentModule({ ...currentModule, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                  placeholder="e.g. Finances, Secretariat..."
                />
              </div>

              {/* Responsible */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Module Responsible</label>
                <select
                  value={currentModule.responsibleId || ''}
                  onChange={e => setCurrentModule({ ...currentModule, responsibleId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                >
                  <option value="">Select responsible...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
                <p className="text-xs opacity-60 mt-2">This person will receive edit requests for this module.</p>
              </div>

              {/* Screens */}
              <div>
                <label className="block text-sm font-medium mb-3 opacity-80">Module Screens</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_SCREENS.map(screen => (
                    <label key={screen.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentModule.screens?.includes(screen.id) ? (isLight ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-500 bg-indigo-500/10') : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/10 hover:border-white/20')}`}>
                      <input
                        type="checkbox"
                        checked={currentModule.screens?.includes(screen.id) || false}
                        onChange={() => toggleScreen(screen.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium">{screen.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium mb-3 opacity-80">Allowed Roles</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currentModule.roles?.includes(role) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/10 text-white/60 hover:bg-white/20')}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!currentModule.name || !currentModule.responsibleId}
                  className="flex-1 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Module
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(module => {
              const responsible = users.find(u => u.id === module.responsibleId);
              return (
                <div key={module.id} className={`rounded-3xl border p-6 transition-all hover:shadow-xl ${isLight ? 'bg-white border-slate-200 hover:border-indigo-200' : 'bg-[#141414] border-white/10 hover:border-indigo-500/30'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {module.image ? (
                        <img src={module.image} alt={module.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          <Layers size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{module.name}</h3>
                        <p className="text-xs opacity-60">{module.screens.length} screens</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCurrentModule(module); setIsEditing(true); }} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(module.id)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-500/10 text-red-400 hover:text-red-300'}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-medium opacity-60 uppercase tracking-wider">Responsible</span>
                      <div className="flex items-center gap-2 mt-1">
                        {responsible?.photo ? (
                          <img src={responsible.photo} alt={responsible.firstName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {responsible?.firstName?.[0]}
                          </div>
                        )}
                        <span className="text-sm font-medium">{responsible?.firstName} {responsible?.lastName}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium opacity-60 uppercase tracking-wider">Roles</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {module.roles.map(role => (
                          <span key={role} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white/70'}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {modules.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                <Layers size={48} className="mb-4" />
                <p className="text-lg font-medium">No modules configured</p>
                <p className="text-sm">Create a module to organize screens and assign responsibles.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
