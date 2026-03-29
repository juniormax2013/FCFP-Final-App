
import React, { useState, useMemo, useRef } from 'react';
import { User, Translation, Member, SystemSettings, ModulePermission } from '../types';
import { 
  ArrowLeft, Plus, Search, X, Trash2, Edit3, ChevronRight, 
  User as UserIcon, Check, QrCode, Camera, Mail, Phone, 
  MapPin, Calendar, Globe, Heart, Shield, Briefcase, Sparkles, Users, KeyRound, Edit2, RotateCcw, Maximize2, Flame, AlertCircle
} from 'lucide-react';
import { compressImage, formatToMMDDYYYY, getLocalYYYYMMDD } from '../lib/utils';
import { MemberIDCard } from './MemberIDCard';

interface MemberFormModalProps {
  initialData?: Member;
  onClose: () => void;
  onSave: (m: Member) => void;
  isLight: boolean;
  translation: Translation;
  settings: SystemSettings;
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({ 
  initialData, onClose, onSave, isLight, translation, settings 
}) => {
  const [formData, setFormData] = useState<Partial<Member>>(initialData || {
    photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    firstName: '',
    lastName: '',
    gender: 'Male',
    birthDate: '',
    civilStatus: 'Single',
    nationality: 'American',
    primaryLanguage: 'English',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'USA',
    isActive: true,
    entryDate: getLocalYYYYMMDD(),
    spiritualStatus: 'Baptized',
    memberType: 'Regular',
    department: 'Worship',
    churchRole: 'Member',
    spouseName: '',
    spouseRelationship: 'Spouse',
    emergencyName: '',
    emergencyPhone: '',
    baptismDate: '',
    baptismPlace: '',
    conversionDate: '',
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'family' | 'church'>('personal');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName) {
      setAlertMessage("First Name and Last Name are mandatory");
      return;
    }
    onSave({
      ...formData,
      id: formData.id || `M-${Date.now().toString().slice(-6)}`,
      updatedAt: new Date().toISOString(),
    } as Member);
  };

  const handlePhotoClick = () => fileRef.current?.click();

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 400, 400);
        setFormData({ ...formData, photo: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = `w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`;
  const labelClass = `text-[10px] uppercase font-black tracking-widest px-1 opacity-40 mb-1 block`;

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300`}>
      <div className={`w-full max-w-2xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        
        {/* Header Modal */}
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <UserIcon size={20} />
             </div>
             <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
               {initialData ? 'Edit Profile' : 'New Member'}
             </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 opacity-50"><X size={24}/></button>
        </div>

        {/* Tabs de Navegación del Formulario */}
        <div className="flex border-b border-white/5 p-2 gap-2 overflow-x-auto scrollbar-hide">
           {[
             { id: 'personal', icon: <UserIcon size={14}/>, label: 'Personal' },
             { id: 'contact', icon: <Phone size={14}/>, label: 'Contact' },
             { id: 'family', icon: <Heart size={14}/>, label: 'Family' },
             { id: 'church', icon: <Shield size={14}/>, label: 'Church' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex-1 min-w-[80px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
          
          {/* PERSONAL SECTION */}
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="flex flex-col items-center mb-8">
                  <div 
                    onClick={handlePhotoClick}
                    className={`relative w-32 h-32 rounded-[40px] overflow-hidden border-4 cursor-pointer group shadow-2xl transition-all hover:scale-105 ${isLight ? 'border-slate-100' : 'border-white/10'}`}
                  >
                     <img src={formData.photo} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" />
                     </div>
                  </div>
                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onPhotoChange} />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass} />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={inputClass}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Birth Date</label>
                    <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className={inputClass} />
                  </div>
               </div>
            </div>
          )}

          {/* CONTACT SECTION */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                  </div>
               </div>
               <div>
                 <label className={labelClass}>Address</label>
                 <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className={inputClass} />
                  </div>
               </div>
            </div>
          )}

          {/* FAMILY / EMERGENCY SECTION */}
          {activeTab === 'family' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={14} className="text-rose-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Spouse Information</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Spouse Name</label>
                      <input type="text" value={formData.spouseName} onChange={e => setFormData({...formData, spouseName: e.target.value})} className={inputClass} placeholder="Full name" />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <select value={formData.spouseRelationship} onChange={e => setFormData({...formData, spouseRelationship: e.target.value})} className={inputClass}>
                         {translation.listSpouseRelationshipTypes.map((r: string) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={14} className="text-orange-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Emergency Contact</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Contact Name</label>
                      <input type="text" value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} className={inputClass} placeholder="Ej: Padre, Amigo..." />
                    </div>
                    <div>
                      <label className={labelClass}>Emergency Phone</label>
                      <input type="tel" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} className={inputClass} placeholder="+1..." />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* CHURCH SECTION */}
          {activeTab === 'church' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Member Type</label>
                    <select value={formData.memberType} onChange={e => setFormData({...formData, memberType: e.target.value})} className={inputClass}>
                       {translation.listMemberTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className={inputClass}>
                       {translation.listDepartments.map((d: string) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Spiritual Status</label>
                    <select value={formData.spiritualStatus} onChange={e => setFormData({...formData, spiritualStatus: e.target.value})} className={inputClass}>
                       {translation.listSpiritualStatuses.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Join Date</label>
                    <input type="date" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} className={inputClass} />
                  </div>
               </div>
               
               {/* NEW FIELD: CONVERSION DATE */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Conversion Date</label>
                    <input 
                      type="date" 
                      value={formData.conversionDate || ''} 
                      onChange={e => setFormData({...formData, conversionDate: e.target.value})} 
                      className={inputClass} 
                    />
                  </div>
                  <div className="hidden sm:block" />
               </div>

               <div className="p-6 rounded-[32px] border space-y-6 transition-all bg-blue-500/5 border-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame size={16} className="text-orange-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Baptism Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Baptism Date</label>
                      <input 
                        type="date" 
                        value={formData.baptismDate || ''} 
                        onChange={e => setFormData({...formData, baptismDate: e.target.value})} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Baptism Location</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Iglesia Central, Río..."
                        value={formData.baptismPlace || ''} 
                        onChange={e => setFormData({...formData, baptismPlace: e.target.value})} 
                        className={inputClass} 
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
           <button onClick={onClose} className={`flex-1 py-4 font-bold ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{translation.cancel}</button>
           <button 
             onClick={handleSave} 
             className="flex-[2] py-4 bg-blue-600 rounded-3xl font-bold text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
           >
             {initialData ? translation.save : translation.addMember}
           </button>
        </div>
      </div>

      {/* Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isLight ? 'bg-white' : 'bg-slate-900 border border-slate-800'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Notice</h3>
            <p className={`mb-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{alertMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertMessage(null)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MembersScreenProps {
  currentUser: User; 
  translation: Translation; 
  settings: SystemSettings; 
  members: Member[]; 
  onBack: () => void; 
  onAddMember: (member: Member) => void; 
  onUpdateMember: (member: Member) => void; 
  onDeleteMember: (id: string) => void; 
  permissions: ModulePermission;
}

export const MembersScreen: React.FC<MembersScreenProps> = ({ 
  currentUser, translation, settings, members, onBack, onAddMember, onUpdateMember, onDeleteMember, permissions 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showQRModal, setShowQRModal] = useState<Member | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  // Estados para cambio de PIN rápido por Super Usuario
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const isLight = settings.theme === 'light';

  const filteredMembers = useMemo(() => {
    return (members || []).filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const handleEditClick = (m: Member) => {
    setEditingMember(m);
    setViewingMember(null);
    setShowFormModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteMember(confirmDeleteId);
      setViewingMember(null);
      setConfirmDeleteId(null);
    }
  };

  const handleQuickPinUpdate = () => {
    if (!viewingMember) return;
    if (newPinValue.length !== 4) {
      setAlertMessage("El PIN debe ser de exactamente 4 dígitos.");
      return;
    }
    
    const updated: Member = {
      ...viewingMember,
      pin: newPinValue,
      updatedAt: new Date().toISOString()
    };
    
    onUpdateMember(updated);
    setIsEditingPin(false);
    setNewPinValue('');
    setViewingMember(updated); // Actualizar vista previa local
    setAlertMessage("PIN actualizado exitosamente.");
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      
      {/* Header Fijo */}
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-black tracking-tight">{translation.moduleNames.members}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{members?.length || 0} Registrados</p>
          </div>
        </div>
        {permissions.canCreate && (
          <button 
            onClick={() => { setEditingMember(null); setShowFormModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95"
          >
            <Plus size={18} /><span className="hidden sm:inline font-bold text-sm">Add Member</span>
          </button>
        )}
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        {/* Barra de Búsqueda */}
        <div className="relative mb-10 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20 group-focus-within:text-blue-400'}`} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className={`w-full border rounded-[32px] py-5 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white placeholder:text-white/10'}`} 
          />
        </div>

        {/* Member List */}
        <div className="flex flex-col gap-4">
          {filteredMembers.map((m) => (
            <div 
              key={m.id} 
              onClick={() => setViewingMember(m)} 
              className={`rounded-3xl p-4 flex items-start gap-4 transition-all group cursor-pointer active:scale-[0.98] shadow-sm border ${isLight ? 'bg-white border-slate-100 hover:shadow-md' : 'bg-[#151619] border-white/5 hover:bg-white/5'}`}
            >
              <div className="relative flex-shrink-0">
                <img src={m.photo} className="w-20 h-20 rounded-2xl object-cover" alt={`${m.firstName} ${m.lastName}`} />
                {m.isActive && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#151619]" />}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h4 className={`font-bold text-base mb-2 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{m.firstName} {m.lastName}</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="truncate">{m.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{m.address || 'No address provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">{m.entryDate ? formatToMMDDYYYY(m.entryDate) : 'No date'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="py-32 text-center opacity-20 italic">
             <UserIcon size={64} className="mx-auto mb-4" />
             <p className="text-xl font-bold">No members found</p>
          </div>
        )}
      </div>

      {/* Member Detail Viewer */}
      {viewingMember && (
        <div className={`fixed inset-0 z-[140] flex items-center justify-center p-0 sm:p-6 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/40' : 'bg-black/80'}`}>
          <div className={`w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md md:max-w-lg sm:rounded-[40px] overflow-hidden flex flex-col relative ${isLight ? 'bg-white text-slate-900' : 'bg-[#151619] text-white'} shadow-2xl`}>
            
            {/* Header Background */}
            <div className="relative h-48 sm:h-56 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${viewingMember.photo})` }}>
               <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
               <button 
                onClick={(e) => { e.stopPropagation(); setViewingMember(null); setIsEditingPin(false); }} 
                className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors z-20 backdrop-blur-md"
               >
                 <ArrowLeft size={24} className="text-white" />
               </button>
            </div>

            {/* White Card Content */}
            <div className={`flex-1 min-h-0 flex flex-col relative -mt-10 rounded-t-[40px] ${isLight ? 'bg-white' : 'bg-[#151619]'}`}>
               
               {/* Profile Picture */}
               <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                 <div 
                   className={`w-32 h-32 rounded-full border-4 ${isLight ? 'border-white' : 'border-[#151619]'} overflow-hidden bg-slate-200 cursor-pointer shadow-lg`}
                   onClick={() => setFullScreenImage(viewingMember.photo)}
                 >
                   <img src={viewingMember.photo} className="w-full h-full object-cover" />
                 </div>
               </div>

               <div className="pt-20 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                 {/* Name and Role */}
                 <div className="text-center mb-6">
                   <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase">{viewingMember.firstName} {viewingMember.lastName}</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">
                     {[viewingMember.churchRole, viewingMember.department].filter(Boolean).join(' • ') || 'Member'}
                   </p>
                 </div>

                 {/* Stats Row */}
                 <div className="flex justify-center items-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{viewingMember.id}</p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">ID</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{viewingMember.memberType}</p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">Type</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{viewingMember.spiritualStatus || 'Active'}</p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">Status</p>
                    </div>
                 </div>

                 {/* Bio / Description */}
                 <div className="text-center mb-6 px-4">
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                     {viewingMember.email ? `Email: ${viewingMember.email}` : ''}
                     {viewingMember.email && viewingMember.phone ? ' • ' : ''}
                     {viewingMember.phone ? `Phone: ${viewingMember.phone}` : ''}
                   </p>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex gap-4 mb-8">
                    {permissions.canEdit && (
                      <button 
                        onClick={() => handleEditClick(viewingMember)} 
                        className="flex-1 py-3 bg-[#b24c4c] hover:bg-[#9a3f3f] text-white rounded-full font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Edit Profile
                      </button>
                    )}
                    <button 
                      onClick={() => setShowQRModal(viewingMember)} 
                      className={`flex-1 py-3 rounded-full font-bold shadow-sm border transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isLight ? 'bg-white border-[#b24c4c] text-[#b24c4c]' : 'bg-transparent border-[#b24c4c] text-[#b24c4c]'}`}
                    >
                      QR Code
                    </button>
                 </div>

                 {/* All Information Content */}
                 <div className="flex-1 space-y-4">
                    {/* PIN Section (Super User) */}
                    {currentUser.id === '1' && (
                      <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md">
                                  <KeyRound size={18} />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-600 dark:text-amber-500">Access PIN</p>
                                  <p className="text-[9px] font-bold opacity-60 uppercase text-amber-700 dark:text-amber-400">Super User Control</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                               {isEditingPin ? (
                                  <div className="flex items-center gap-2">
                                     <input 
                                       autoFocus
                                       type="tel"
                                       maxLength={4}
                                       value={newPinValue}
                                       onChange={e => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                                       className={`w-20 bg-white dark:bg-black/20 border border-amber-300 dark:border-amber-500/30 rounded-lg px-2 py-1.5 text-lg font-mono font-black tracking-widest text-amber-600 dark:text-amber-500 text-center focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                       placeholder="----"
                                     />
                                     <button 
                                       onClick={handleQuickPinUpdate}
                                       className="p-2 bg-amber-500 text-white rounded-lg shadow-md active:scale-95 transition-transform"
                                     >
                                        <Check size={16} />
                                     </button>
                                     <button 
                                       onClick={() => { setIsEditingPin(false); setNewPinValue(''); }}
                                       className="p-2 bg-white dark:bg-transparent text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/30 rounded-lg active:scale-95 transition-transform"
                                     >
                                        <X size={16} />
                                     </button>
                                  </div>
                               ) : (
                                 <>
                                    <p className="text-2xl font-mono font-black tracking-[0.2em] text-amber-600 dark:text-amber-500">
                                       {viewingMember.pin || '----'}
                                    </p>
                                    <button 
                                      onClick={() => { setIsEditingPin(true); setNewPinValue(viewingMember.pin || ''); }}
                                      className="p-2 bg-amber-200/50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-300 dark:hover:bg-amber-500/40 transition-colors active:scale-95"
                                    >
                                       <Edit2 size={14} />
                                    </button>
                                 </>
                               )}
                            </div>
                         </div>
                      </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={16} className="text-[#4a8f79]" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Address</p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{viewingMember.address || 'No address provided'}</p>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={16} className="text-[#b24c4c]" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Emergency Contact</p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] opacity-50 uppercase">Name</p>
                          <p className="text-sm font-semibold">{viewingMember.emergencyName || '---'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-50 uppercase">Phone</p>
                          <p className="text-sm font-semibold">{viewingMember.emergencyPhone || '---'}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-[#4a8f79]" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Family Details</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] opacity-50 uppercase">Spouse</p>
                          <p className="text-sm font-semibold">{viewingMember.spouseName || '---'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-50 uppercase">Relationship</p>
                          <p className="text-sm font-semibold">{viewingMember.spouseRelationship || '---'}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={16} className="text-[#4a8f79]" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Spiritual Journey</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-[10px] opacity-50 uppercase">Entry Date</p><p className="text-sm font-semibold">{formatToMMDDYYYY(viewingMember.entryDate) || '---'}</p></div>
                        <div><p className="text-[10px] opacity-50 uppercase">Country</p><p className="text-sm font-semibold truncate">{viewingMember.country || '---'}</p></div>
                        <div><p className="text-[10px] opacity-50 uppercase">Language</p><p className="text-sm font-semibold truncate">{viewingMember.primaryLanguage || '---'}</p></div>
                        {viewingMember.conversionDate && (
                          <div><p className="text-[10px] opacity-50 uppercase">Conversion</p><p className="text-sm font-semibold">{formatToMMDDYYYY(viewingMember.conversionDate)}</p></div>
                        )}
                        {viewingMember.baptismDate && (
                          <div><p className="text-[10px] opacity-50 uppercase">Baptism</p><p className="text-sm font-semibold">{formatToMMDDYYYY(viewingMember.baptismDate)}</p></div>
                        )}
                        {viewingMember.baptismPlace && (
                          <div className="col-span-2"><p className="text-[10px] opacity-50 uppercase">Baptism Place</p><p className="text-sm font-semibold">{viewingMember.baptismPlace}</p></div>
                        )}
                      </div>
                    </div>
                 </div>

                 {/* Delete Button (if permitted) */}
                 {permissions.canDelete && (
                   <div className="mt-6">
                     <button 
                       onClick={() => handleDeleteClick(viewingMember.id)} 
                       className="w-full py-3 font-bold text-red-500 hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-500/20"
                     >
                       Delete Member
                     </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Visor de Foto a Pantalla Completa */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-300 p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <button 
            className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white z-[210] hover:bg-white/20 transition-all"
            onClick={() => setFullScreenImage(null)}
          >
            <X size={32} />
          </button>
          
          <div className="relative max-w-full max-h-full">
             <img 
               src={fullScreenImage} 
               className="max-w-[95vw] max-h-[85vh] rounded-[32px] shadow-2xl object-contain border border-white/10 animate-in zoom-in-95 duration-500" 
               alt="Full View" 
               onClick={(e) => e.stopPropagation()}
             />
             <div className="mt-6 flex justify-center">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/5">
                  Foto de Perfil Original
                </p>
             </div>
          </div>
        </div>
      )}

      {/* Formulario Modal (Alta/Edición) */}
      {showFormModal && (
        <MemberFormModal 
          isLight={isLight} 
          translation={translation} 
          settings={settings}
          initialData={editingMember || undefined}
          onClose={() => { setShowFormModal(false); setEditingMember(null); }}
          onSave={m => {
            if (editingMember) onUpdateMember(m);
            else onAddMember(m);
            setShowFormModal(false);
            setEditingMember(null);
            setViewingMember(null);
          }}
        />
      )}

      {/* Modal de ID Digital */}
      {showQRModal && (
        <MemberIDCard 
          member={showQRModal} 
          isLight={isLight} 
          translation={translation} 
          settings={settings}
          onClose={() => setShowQRModal(null)} 
        />
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isLight ? 'bg-white' : 'bg-slate-900 border border-slate-800'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Notice</h3>
            <p className={`mb-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{alertMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertMessage(null)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isLight ? 'bg-white' : 'bg-slate-900 border border-slate-800'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Confirm Delete</h3>
            <p className={`mb-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Are you sure you want to delete this member? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
