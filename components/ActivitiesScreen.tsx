
import React, { useState, useRef, useMemo } from 'react';
import { User, Translation, Activity, SystemSettings, Member, ModulePermission, ActivityParticipant } from '../types';
import { 
  ArrowLeft, Plus, Clock, MapPin, X, Trash2, Edit3, 
  Search, AlertCircle, Camera, Users, UserPlus, Check, Award
} from 'lucide-react';
import { compressImage, formatToMMDDYYYY, getLocalYYYYMMDDTHHMM } from '../lib/utils';

export interface ActivityFormModalProps {
  initialData?: Activity;
  onClose: () => void;
  onSave: (a: Activity) => void;
  isLight: boolean;
  translation: Translation;
  currentUser: User;
  members: Member[];
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({ 
  initialData, onClose, onSave, isLight, translation, currentUser, members 
}) => {
  const [formData, setFormData] = useState<Partial<Activity>>(initialData || {
    title: '',
    category: 'Spiritual',
    status: 'Active',
    time: new Date().toISOString(),
    address: '',
    department: 'Alabanza',
    image: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=800',
    participants: initialData?.participants || []
  });

  const [memberSearch, setMemberSearch] = useState('');
  const [showExternalInput, setShowExternalInput] = useState(false);
  const [externalName, setExternalName] = useState('');
  const [assigningRole, setAssigningRole] = useState('');
  const [selectedForRole, setSelectedForRole] = useState<Member | { name: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return [];
    return members.filter(m => 
      (`${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()) || 
       m.id.toLowerCase().includes(memberSearch.toLowerCase())) &&
      !formData.participants?.some(p => p.id === m.id)
    ).slice(0, 5);
  }, [memberSearch, members, formData.participants]);

  const handlePhotoClick = () => fileRef.current?.click();

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 800, 600);
        setFormData({ ...formData, image: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const addParticipant = (p: ActivityParticipant) => {
    setFormData(prev => ({
      ...prev,
      participants: [...(prev.participants || []), p]
    }));
    setSelectedForRole(null);
    setAssigningRole('');
    setExternalName('');
    setMemberSearch('');
    setShowExternalInput(false);
  };

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.title) {
      alert("Por favor ingrese un título");
      return;
    }
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
      createdBy: currentUser.id,
      updatedAt: new Date().toISOString()
    } as Activity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border animate-in zoom-in-95 duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                <Plus size={20}/>
             </div>
             <h3 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
               {initialData?.id ? 'Edit Activity' : 'New Activity'}
             </h3>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 scrollbar-hide">
          
          {/* FOTO DE LA ACTIVIDAD */}
          <div className="space-y-4">
             <label className={`text-[10px] uppercase font-black tracking-widest opacity-40 px-1`}>Portada de Actividad</label>
             <div 
               onClick={handlePhotoClick}
               className={`relative aspect-video w-full rounded-[32px] overflow-hidden border-2 border-dashed group cursor-pointer transition-all hover:border-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
             >
                <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={32} className="text-white mb-2" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Cambiar Imagen</span>
                </div>
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onPhotoChange} />
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest opacity-40 px-1`}>Título</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Activity name"
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={`text-[10px] uppercase font-black tracking-widest opacity-40 px-1`}>Categoría</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                >
                  <option value="Spiritual">Spiritual</option>
                  <option value="Youth">Youth</option>
                  <option value="Service">Service</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] uppercase font-black tracking-widest opacity-40 px-1`}>Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
                >
                  <option value="Active">Active</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest opacity-40 px-1`}>Date and Time</label>
              <input 
                type="datetime-local" 
                value={formData.time ? getLocalYYYYMMDDTHHMM(new Date(formData.time)) : ''} 
                onChange={e => setFormData({...formData, time: new Date(e.target.value).toISOString()})}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-black tracking-widest opacity-40 px-1`}>Address / Location</label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Event location"
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
            </div>
          </div>

          {/* PARTICIPANTS AND ROLES SECTION */}
          <div className="space-y-6 pt-6 border-t border-white/5">
             <div className="flex items-center justify-between">
                <div>
                   <h4 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-slate-900' : 'text-white'}`}>Staff & Participants</h4>
                   <p className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">Assign roles and responsibilities</p>
                </div>
                <Users size={20} className="opacity-20" />
             </div>

             <div className="space-y-4">
                {/* Member Selector / Search */}
                {!selectedForRole ? (
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      type="text" 
                      placeholder="Search member to assign..."
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      className={`w-full border rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
                    />
                    {filteredMembers.length > 0 && (
                      <div className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-top-2 ${isLight ? 'bg-white' : 'bg-slate-900 border-white/10'}`}>
                        {filteredMembers.map(m => (
                          <button 
                            key={m.id} 
                            onClick={() => setSelectedForRole(m)} 
                            className={`w-full flex items-center gap-3 p-3 hover:bg-blue-500/10 text-left border-b last:border-0 ${isLight ? 'border-slate-50' : 'border-white/5'}`}
                          >
                            <img src={m.photo} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                               <p className="text-sm font-bold">{m.firstName} {m.lastName}</p>
                               <p className="text-[9px] font-black uppercase opacity-40">{m.id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <button 
                      onClick={() => setShowExternalInput(true)}
                      className={`mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:opacity-100 opacity-60 transition-opacity px-1`}
                    >
                       <UserPlus size={14} /> + Add external person
                    </button>

                    {showExternalInput && (
                      <div className={`mt-4 p-4 rounded-3xl border animate-in zoom-in-95 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                         <div className="flex gap-2">
                           <input 
                             autoFocus
                             type="text" 
                             placeholder="Type full name..."
                             value={externalName}
                             onChange={e => setExternalName(e.target.value)}
                             className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none ${isLight ? 'bg-white' : 'bg-black/40 border-white/10'}`}
                           />
                           <button 
                             onClick={() => { if(externalName.trim()) setSelectedForRole({ name: externalName }); }}
                             className="p-2 bg-blue-600 text-white rounded-xl active:scale-90 transition-transform"
                           >
                              <Check size={20} />
                           </button>
                           <button onClick={() => { setShowExternalInput(false); setExternalName(''); }} className="p-2 opacity-40"><X size={20}/></button>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ROL Assignment Form */
                  <div className={`p-5 rounded-[32px] border animate-in zoom-in-95 ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'}`}>
                     <div className="flex items-center gap-4 mb-4">
                        {(selectedForRole as Member).photo ? (
                          <img src={(selectedForRole as Member).photo} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                             <Users size={24} />
                          </div>
                        )}
                        <div>
                           <p className="text-sm font-black">{(selectedForRole as Member).firstName ? `${(selectedForRole as Member).firstName} ${(selectedForRole as Member).lastName}` : (selectedForRole as {name:string}).name}</p>
                           <p className="text-[10px] font-bold uppercase opacity-60">Assign Responsibility</p>
                        </div>
                        <button onClick={() => setSelectedForRole(null)} className="ml-auto p-2 opacity-40 hover:opacity-100"><X size={18}/></button>
                     </div>
                     <div className="flex gap-3">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="What will they do? Ex: Preacher, Kitchen..."
                          value={assigningRole}
                          onChange={e => setAssigningRole(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && assigningRole.trim() && addParticipant({
                            id: (selectedForRole as Member).id,
                            name: (selectedForRole as Member).firstName ? `${(selectedForRole as Member).firstName} ${(selectedForRole as Member).lastName}` : (selectedForRole as {name:string}).name,
                            role: assigningRole,
                            photo: (selectedForRole as Member).photo
                          })}
                          className={`flex-1 border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-white border-blue-200' : 'bg-black/40 border-white/10'}`}
                        />
                        <button 
                          onClick={() => addParticipant({
                            id: (selectedForRole as Member).id,
                            name: (selectedForRole as Member).firstName ? `${(selectedForRole as Member).firstName} ${(selectedForRole as Member).lastName}` : (selectedForRole as {name:string}).name,
                            role: assigningRole,
                            photo: (selectedForRole as Member).photo
                          })}
                          disabled={!assigningRole.trim()}
                          className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                        >
                           <Check size={24} />
                        </button>
                     </div>
                  </div>
                )}

                {/* Current Participants List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {formData.participants?.map((p, idx) => (
                     <div key={idx} className={`flex items-center justify-between p-4 rounded-3xl border group transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                           {p.photo ? (
                             <img src={p.photo} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                           ) : (
                             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                               <Users size={18} />
                             </div>
                           )}
                           <div className="min-w-0">
                              <p className="text-xs font-black truncate">{p.name}</p>
                              <div className="flex items-center gap-1.5">
                                 <Award size={12} className="text-blue-500" />
                                 <p className="text-[10px] font-black uppercase text-blue-500 truncate">{p.role}</p>
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => removeParticipant(idx)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
            {translation.cancel}
          </button>
          <button 
            onClick={handleSave} 
            className="flex-[2] py-4 bg-blue-600 rounded-3xl font-bold text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
          >
            {initialData ? translation.save : translation.createActivity}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ActivitiesScreenProps {
  currentUser: User; translation: Translation; settings: SystemSettings; activities: Activity[]; members: Member[]; onBack: () => void; onAddActivity: (a: Activity) => void; onUpdateActivity: (a: Activity) => void; onDeleteActivity: (id: string) => void; permissions: ModulePermission;
}

export const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({ 
  currentUser, translation, settings, activities, members, onBack, onAddActivity, onUpdateActivity, onDeleteActivity, permissions 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const isLight = settings.theme === 'light';

  const filteredActivities = activities.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-black tracking-tight">{translation.activities}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Eventos & Ministerio</p>
          </div>
        </div>
        {permissions.canCreate && (
          <button onClick={() => setShowFormModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"><Plus size={18} /><span className="hidden sm:inline font-bold text-sm">New Activity</span></button>
        )}
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((a) => (
            <div key={a.id} className={`rounded-[40px] overflow-hidden border shadow-xl flex flex-col transition-all group hover:scale-[1.02] ${isLight ? 'bg-white border-slate-100 hover:border-blue-200' : 'glass border-white/5 hover:bg-white/10'}`}>
              <div className="relative aspect-video">
                 <img src={a.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                 <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">{a.category}</div>
                 <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${a.status === 'Active' ? 'bg-green-500/80 text-white border-green-400' : 'bg-red-500/80 text-white border-red-400'}`}>
                    {a.status}
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="font-black text-xl leading-tight mb-4">{a.title}</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs opacity-60 font-bold uppercase tracking-widest"><Clock size={14} className="text-blue-500" /> {formatToMMDDYYYY(a.time)} {new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="flex items-center gap-3 text-xs opacity-60 font-bold uppercase tracking-widest"><MapPin size={14} className="text-red-500" /> {a.address}</div>
                </div>

                {a.participants && a.participants.length > 0 && (
                   <div className="mb-6">
                      <div className="flex -space-x-2">
                        {a.participants.slice(0, 5).map((p, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0a0a0a] overflow-hidden ${!p.photo ? 'bg-blue-600 flex items-center justify-center text-[10px] text-white font-black' : ''}`}>
                             {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                          </div>
                        ))}
                        {a.participants.length > 5 && (
                          <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-slate-800 flex items-center justify-center text-[10px] text-white font-black">+{a.participants.length - 5}</div>
                        )}
                      </div>
                   </div>
                )}

                <div className="mt-auto flex gap-3">
                   {permissions.canEdit && (
                     <button onClick={() => setEditingActivity(a)} className="flex-1 py-3 rounded-2xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14} /> Edit</button>
                   )}
                   {permissions.canDelete && (
                     <button onClick={() => setActivityToDelete(a.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={18} /></button>
                   )}
                </div>
              </div>
            </div>
          ))}
          {filteredActivities.length === 0 && (
            <div className="col-span-full py-32 text-center opacity-20 italic">
              <AlertCircle size={64} className="mx-auto mb-4" />
              <p className="text-2xl font-black">Sin actividades encontradas</p>
            </div>
          )}
        </div>
      </div>

      {activityToDelete && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col shadow-2xl border p-8 text-center ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <h3 className="text-xl font-black mb-4">Are you sure you want to delete this activity?</h3>
            <p className={`text-sm mb-8 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setActivityToDelete(null)} className={`flex-1 py-4 font-bold rounded-2xl transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Cancel</button>
              <button onClick={() => { onDeleteActivity(activityToDelete); setActivityToDelete(null); }} className="flex-1 py-4 font-bold bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {(showFormModal || editingActivity) && (
        <ActivityFormModal 
          initialData={editingActivity || undefined}
          onClose={() => { setShowFormModal(false); setEditingActivity(null); }}
          onSave={a => { if (editingActivity) onUpdateActivity(a); else onAddActivity(a); setShowFormModal(false); setEditingActivity(null); }}
          isLight={isLight}
          translation={translation}
          currentUser={currentUser}
          members={members}
        />
      )}
    </div>
  );
};
