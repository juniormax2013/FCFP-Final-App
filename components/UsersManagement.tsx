
import React, { useState, useRef, useMemo } from 'react';
import { User, Translation, SystemSettings, UserRole } from '../types';
import { ArrowLeft, UserPlus, Camera, ShieldCheck, Mail, Phone, MapPin, KeyRound, X, Edit3, Eye, EyeOff, Shield, Loader2, Cloud, Users as UsersIcon, Lock, Calendar } from 'lucide-react';
import { compressImage } from '../lib/utils';
import { isPinUniqueOnline } from '../lib/googleSheets';

interface UserModalContentProps {
  user: Partial<User>;
  currentUser: User;
  isEdit?: boolean;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  isLight: boolean;
  translation: Translation;
  genders: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEdit: boolean) => void;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  setNewUser: React.Dispatch<React.SetStateAction<Partial<User>>>;
  createFileInputRef: React.RefObject<HTMLInputElement | null>;
  editFileInputRef: React.RefObject<HTMLInputElement | null>;
}

const UserModalContent: React.FC<UserModalContentProps> = ({ 
  user, currentUser, isEdit = false, isSaving, onSave, onClose, isLight, translation, genders, 
  handleFileChange, handleInputChange, setEditingUser, setNewUser, 
  createFileInputRef, editFileInputRef 
}) => {
  const [localShowPin, setLocalShowPin] = useState(false);
  const isSuper = user.id === '1';
  const isReadOnly = currentUser.role !== 'admin' && currentUser.id !== '1';
  const canSeePin = !(isSuper && currentUser.id !== '1');
  const availableRoles: UserRole[] = ['admin', 'secretaria', 'contable', 'user'];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-hidden ${isLight ? 'bg-slate-900/60' : 'bg-black/70'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border animate-in zoom-in-95 duration-300 ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className={`p-6 sm:p-8 flex justify-between items-center border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
             <h3 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
               {isReadOnly ? translation.details : (isEdit ? translation.edit : translation.addUser)}
             </h3>
             {isReadOnly && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-2 py-1 rounded-full border border-amber-500/20">{translation.staffOnlyRead}</span>}
          </div>
          <button onClick={onClose} disabled={isSaving} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white'}`}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
          <div className="flex flex-col items-center">
            <div 
              onClick={() => !isSaving && !isReadOnly && (isEdit ? editFileInputRef : createFileInputRef).current?.click()}
              className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-[32px] sm:rounded-[40px] overflow-hidden border-4 group shadow-2xl transition-all ${isReadOnly ? '' : 'cursor-pointer hover:border-blue-500/50'} ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-white/5'}`}
            >
              <img src={user.photo} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Avatar" />
              {!isReadOnly && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={32} />
                </div>
              )}
              <input type="file" ref={isEdit ? editFileInputRef : createFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, isEdit)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase tracking-widest font-black px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.firstName}</label>
              <input type="text" name="firstName" value={user.firstName} onChange={(e) => handleInputChange(e, isEdit)} disabled={isSaving || isReadOnly} className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'} ${isReadOnly ? 'opacity-70' : ''}`} />
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] uppercase tracking-widest font-black px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.lastName}</label>
              <input type="text" name="lastName" value={user.lastName} onChange={(e) => handleInputChange(e, isEdit)} disabled={isSaving || isReadOnly} className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'} ${isReadOnly ? 'opacity-70' : ''}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase tracking-widest font-black px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.email}</label>
              <input type="email" name="email" value={user.email} onChange={(e) => handleInputChange(e, isEdit)} disabled={isSaving || isReadOnly} className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'} ${isReadOnly ? 'opacity-70' : ''}`} />
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] uppercase tracking-widest font-black px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.role}</label>
              <div className="relative">
                <select name="role" value={user.role} disabled={isSuper || isSaving || isReadOnly} onChange={(e) => handleInputChange(e, isEdit)} className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none transition-all appearance-none ${isSuper || isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}>
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{translation.roles[r]}</option>
                  ))}
                  {isSuper && <option value="admin">{translation.roles.super}</option>}
                </select>
                {!isSuper && !isReadOnly && <Shield size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-300' : 'text-white/20'}`} />}
                {isReadOnly && <Lock size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40`} />}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] uppercase tracking-widest font-black px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.staffUniquePin}</label>
            <div className="relative">
              <input 
                type={(localShowPin && canSeePin) ? "text" : "password"} 
                name="pin" 
                maxLength={4} 
                disabled={isSuper || isSaving || isReadOnly}
                value={!canSeePin ? '****' : user.pin} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (isEdit) setEditingUser(prev => prev ? ({...prev, pin: val}) : null);
                  else setNewUser(prev => ({...prev, pin: val}));
                }}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-[0.2em] ${isSuper || isReadOnly ? 'opacity-70 cursor-not-allowed' : ''} ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
              {canSeePin && (
                <button type="button" onClick={() => setLocalShowPin(!localShowPin)} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white'}`}>
                  {localShowPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
            {!isReadOnly && (
              <div className="flex items-center gap-2 px-1 mt-1 opacity-40">
                 <Cloud size={10} />
                 <p className="text-[8px] font-black uppercase tracking-widest">{translation.staffAccessPanel}</p>
              </div>
            )}
          </div>
        </div>

        <div className={`p-6 sm:p-8 flex gap-4 border-t ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
          <button onClick={onClose} disabled={isSaving} className={`flex-1 py-4 rounded-2xl font-bold transition-colors ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-white/60 hover:text-white'}`}>{isReadOnly ? translation.close : translation.cancel}</button>
          {!isReadOnly && (
            <button 
              onClick={onSave} 
              disabled={isSaving}
              className="flex-[2] py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-xl hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSaving ? <><Loader2 className="animate-spin" size={20} /> {translation.staffVerifying}</> : translation.save}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Added missing interface UsersManagementProps
interface UsersManagementProps {
  users: User[];
  currentUser: User;
  translation: Translation;
  settings: SystemSettings;
  genders: string[];
  onBack: () => void;
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ users, currentUser, translation, settings, genders, onBack, onAddUser, onUpdateUser }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ firstName: '', lastName: '', email: '', gender: genders[0] || translation.male, phone: '', address: '', pin: '', role: 'user', photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' });
  
  const isLight = settings.theme === 'light';
  const isReadOnly = currentUser.role !== 'admin' && currentUser.id !== '1';
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const systemUsers = useMemo(() => {
    return users.filter(u => {
      const isNotMember = !u.id.startsWith('M-');
      const hasValidRole = ['admin', 'secretaria', 'contable', 'user'].includes(u.role);
      return !u.deletedAt && isNotMember && hasValidRole;
    });
  }, [users]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEdit = false) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    if (isEdit && editingUser) setEditingUser(prev => prev ? ({ ...prev, [name]: value }) : null);
    else setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        if (isEdit && editingUser) setEditingUser(prev => prev ? ({ ...prev, photo: compressed }) : null);
        else setNewUser(prev => ({ ...prev, photo: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePinUniqueness = async (pin: string, excludeId?: string) => {
    const localConflict = users.some(u => u.pin === pin && u.id !== excludeId && !u.deletedAt);
    if (localConflict) return false;
    if (navigator.onLine && settings.googleSheets.status === 'connected') {
      return await isPinUniqueOnline(pin, excludeId);
    }
    return true;
  };

  const handleSaveNew = async () => {
    if (newUser.firstName && newUser.lastName && newUser.pin && newUser.pin.length === 4) {
      setIsSaving(true);
      const isUnique = await validatePinUniqueness(newUser.pin);
      if (!isUnique) {
        alert("PIN error");
        setIsSaving(false);
        return;
      }

      onAddUser({ ...newUser, id: Date.now().toString(), updatedAt: new Date().toISOString() } as User);
      setShowCreateModal(false);
      setIsSaving(false);
      setNewUser({ firstName: '', lastName: '', email: '', gender: genders[0] || translation.male, phone: '', address: '', pin: '', role: 'user', photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' });
    }
  };

  const handleSaveEdit = async () => {
    if (editingUser && editingUser.firstName && editingUser.lastName && editingUser.pin && editingUser.pin.length === 4) {
      setIsSaving(true);
      const isUnique = await validatePinUniqueness(editingUser.pin, editingUser.id);
      if (!isUnique) {
        alert("PIN error");
        setIsSaving(false);
        return;
      }
      onUpdateUser({ ...editingUser, updatedAt: new Date().toISOString() });
      setEditingUser(null);
      setIsSaving(false);
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-black tracking-tight">{translation.staffTitle}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{translation.staffSubtitle}</p>
          </div>
        </div>
        {!isReadOnly && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all shadow-lg active:scale-95"><UserPlus size={18} /><span className="hidden sm:inline font-bold">{translation.addUser}</span></button>
        )}
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center gap-2 mb-8 px-2 opacity-50">
           <UsersIcon size={14} />
           <p className={`text-[10px] uppercase tracking-[0.3em] font-black`}>Panel • {systemUsers.length} {translation.activeUsers}</p>
        </div>

        <div className="flex flex-col gap-4">
          {systemUsers.map((u) => (
            <div key={u.id} onClick={() => setEditingUser(u)} className={`rounded-3xl p-4 flex items-start gap-4 transition-all group cursor-pointer active:scale-[0.98] shadow-sm border ${isLight ? 'bg-white border-slate-100 hover:shadow-md' : 'bg-[#151619] border-white/5 hover:bg-white/5'}`}>
              <div className="relative flex-shrink-0">
                <img src={u.photo} alt={u.firstName} className="w-20 h-20 rounded-2xl object-cover" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 border-2 flex items-center justify-center ${isLight ? 'border-white' : 'border-[#151619]'}`}>
                   {u.role === 'admin' ? <ShieldCheck size={10} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <div className="flex-1 min-w-0 py-1 text-left">
                <div className="flex items-center justify-between mb-2">
                   <h4 className={`font-bold text-base truncate pr-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{u.firstName} {u.lastName}</h4>
                   {!isReadOnly && <Edit3 size={14} className={`${isLight ? 'text-slate-200' : 'text-white/20'} group-hover:text-blue-400 transition-colors flex-shrink-0`} />}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="truncate">{u.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{u.address || 'No address provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">{u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'No date'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && <UserModalContent user={newUser} currentUser={currentUser} isSaving={isSaving} onSave={handleSaveNew} onClose={() => setShowCreateModal(false)} isLight={isLight} translation={translation} genders={genders} handleFileChange={handleFileChange} handleInputChange={handleInputChange} setEditingUser={setEditingUser} setNewUser={setNewUser} createFileInputRef={createFileInputRef} editFileInputRef={editFileInputRef} />}
      {editingUser && <UserModalContent user={editingUser} currentUser={currentUser} isEdit={true} isSaving={isSaving} onSave={handleSaveEdit} onClose={() => setEditingUser(null)} isLight={isLight} translation={translation} genders={genders} handleFileChange={handleFileChange} handleInputChange={handleInputChange} setEditingUser={setEditingUser} setNewUser={setNewUser} createFileInputRef={createFileInputRef} editFileInputRef={editFileInputRef} />}
    </div>
  );
};
