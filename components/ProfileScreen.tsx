
import React, { useState, useRef } from 'react';
import { User, Translation, SystemSettings } from '../types';
import { ChevronLeft, Camera, ShieldCheck, User as UserIcon, Mail, Phone, MapPin, KeyRound, Users, ChevronRight } from 'lucide-react';

interface InfoRowProps {
  label: string;
  value: string;
  icon: any;
  name: string;
  type?: string;
  editable?: boolean;
  isEditing: boolean;
  isLight: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
}

const InfoRow: React.FC<InfoRowProps> = ({ 
  label, value, icon: Icon, name, type = "text", editable = true, isEditing, isLight, onChange, options 
}) => (
  <div className={`flex items-center gap-4 p-4 border-b last:border-0 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
    <Icon size={20} className={isLight ? 'text-slate-800' : 'text-white/80'} />
    <span className={`font-medium flex-shrink-0 ${isLight ? 'text-slate-900' : 'text-white'}`}>{label}</span>
    
    <div className="flex-1 flex justify-end items-center min-w-0 ml-4">
      {isEditing && editable ? (
        options ? (
          <select 
            name={name} 
            value={value} 
            onChange={onChange}
            className={`w-full max-w-[200px] text-right bg-transparent focus:outline-none ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
            dir="rtl"
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full max-w-[200px] text-right bg-transparent focus:outline-none ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
            placeholder={label}
          />
        )
      ) : (
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`truncate text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{value || '-'}</span>
          <ChevronRight size={18} className={`flex-shrink-0 ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
        </div>
      )}
    </div>
  </div>
);

interface ProfileScreenProps {
  user: User;
  translation: Translation;
  settings: SystemSettings;
  genders: string[];
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  translation, 
  settings,
  genders,
  onBack, 
  onUpdateUser
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [newPin, setNewPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLight = settings.theme === 'light';
  const isSuperUser = user.id === '1';

  const handleSave = () => {
    const updated = { ...formData };
    if (newPin.length === 4 && !isSuperUser) {
      updated.pin = newPin;
    }
    onUpdateUser(updated);
    setIsEditing(false);
    setNewPin('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUploadClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-24 scroll-smooth ${isLight ? 'bg-[#F2F2F6] text-slate-900' : 'bg-black text-white'}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Header */}
      <div className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <button onClick={onBack} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isLight ? 'bg-white shadow-sm text-slate-700 hover:bg-slate-50' : 'bg-white/10 text-white hover:bg-white/20'}`}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold tracking-tight">{translation.profile}</h2>
        {isEditing ? (
          <button 
            onClick={handleSave}
            className="w-10 h-10 flex items-center justify-end text-blue-600 font-semibold text-sm hover:text-blue-500 transition-colors"
          >
            {translation.save}
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-10 h-10 flex items-center justify-end text-blue-600 font-semibold text-sm hover:text-blue-500 transition-colors"
          >
            {translation.edit}
          </button>
        )}
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex flex-col mt-2">
        {/* Top Card */}
        <div className={`w-full rounded-[24px] p-4 flex items-center justify-between shadow-sm mb-8 ${isLight ? 'bg-white' : 'bg-[#151619]'}`}>
          <div className="flex items-center gap-4">
            <div className="relative" onClick={handlePhotoUploadClick}>
              <img 
                src={formData.photo} 
                alt={user.firstName} 
                className={`w-14 h-14 rounded-full object-cover ${isEditing ? 'cursor-pointer opacity-80' : ''}`}
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full pointer-events-none">
                  <Camera size={20} className="text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{formData.firstName} {formData.lastName}</h3>
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>@{translation.roles[formData.role] || formData.role}</p>
            </div>
          </div>
          <ChevronRight size={20} className={isLight ? 'text-slate-400' : 'text-white/30'} />
        </div>

        {/* Profile Details Section */}
        <h3 className={`text-[13px] font-medium mb-2 ml-4 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Profile Details</h3>
        <div className={`w-full rounded-[24px] shadow-sm mb-8 overflow-hidden ${isLight ? 'bg-white' : 'bg-[#151619]'}`}>
          <InfoRow label={translation.firstName} value={formData.firstName} icon={UserIcon} name="firstName" isEditing={isEditing} isLight={isLight} onChange={handleInputChange} />
          <InfoRow label={translation.lastName} value={formData.lastName} icon={UserIcon} name="lastName" isEditing={isEditing} isLight={isLight} onChange={handleInputChange} />
          <InfoRow label={translation.gender} value={formData.gender} icon={Users} name="gender" isEditing={isEditing} isLight={isLight} onChange={handleInputChange} options={genders} />
          <InfoRow label={translation.email} value={formData.email} icon={Mail} name="email" type="email" isEditing={isEditing} isLight={isLight} onChange={handleInputChange} />
          <InfoRow label={translation.phone} value={formData.phone} icon={Phone} name="phone" type="tel" isEditing={isEditing} isLight={isLight} onChange={handleInputChange} />
          <InfoRow label={translation.address} value={formData.address} icon={MapPin} name="address" isEditing={isEditing} isLight={isLight} onChange={handleInputChange} />
        </div>

        {/* Security Section */}
        <h3 className={`text-[13px] font-medium mb-2 ml-4 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Security</h3>
        <div className={`w-full rounded-[24px] shadow-sm mb-8 overflow-hidden ${isLight ? 'bg-white' : 'bg-[#151619]'}`}>
          <div className={`flex items-center gap-4 p-4 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            <KeyRound size={20} className={isLight ? 'text-slate-800' : 'text-white/80'} />
            <span className={`font-medium flex-shrink-0 ${isLight ? 'text-slate-900' : 'text-white'}`}>PIN Code</span>
            
            <div className="flex-1 flex justify-end items-center gap-2 min-w-0 ml-4">
              {isSuperUser ? (
                <span className={`text-xs px-2 py-1 rounded font-bold tracking-tighter ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-white/40'}`}>RESTRICTED</span>
              ) : isEditing ? (
                <input
                  type="text"
                  maxLength={4}
                  placeholder="New PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className={`w-24 text-right bg-transparent focus:outline-none font-mono tracking-widest ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`font-mono tracking-widest text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>••••</span>
                  <ChevronRight size={18} className={`flex-shrink-0 ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <button 
            onClick={() => {
              setIsEditing(false);
              setFormData(user);
              setNewPin('');
            }}
            className={`w-full py-4 rounded-[24px] font-medium transition-colors ${isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {translation.cancel}
          </button>
        )}
      </div>
    </div>
  );
};
