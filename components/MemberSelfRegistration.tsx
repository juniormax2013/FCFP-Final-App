
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, Check, Camera, 
  User, Mail, Phone, MapPin, Calendar, 
  Globe, Languages, ShieldCheck, Heart, Sparkles, Loader2, Flame, Map, AlertCircle
} from 'lucide-react';
import { Translation, Member, SystemSettings, GeoCountry } from '../types';
import { compressImage } from '../lib/utils';

interface Step {
  id: string;
  question: string;
  field: keyof Member;
  type: 'text' | 'date' | 'select' | 'email' | 'tel' | 'photo';
  options?: string[];
  icon: any;
}

interface MemberSelfRegistrationProps {
  translation: Translation;
  settings: SystemSettings;
  countriesList: GeoCountry[];
  onBack: () => void;
  onComplete: (data: Partial<Member>) => void;
}

export const MemberSelfRegistration: React.FC<MemberSelfRegistrationProps> = ({ 
  translation, settings, countriesList, onBack, onComplete 
}) => {
  const isLight = settings.theme === 'light';
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({
    photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    gender: '',
    civilStatus: '',
    nationality: '',
    primaryLanguage: '',
    spiritualStatus: '',
    baptismDate: '',
    baptismPlace: '',
    conversionDate: '',
    isActive: true,
    membershipStatus: translation.active,
    memberType: translation.listMemberTypes[0],
  });

  const photoRef = useRef<HTMLInputElement>(null);

  const steps: Step[] = [
    { id: 'firstName', question: translation.questions.firstName, field: 'firstName', type: 'text', icon: User },
    { id: 'lastName', question: translation.questions.lastName, field: 'lastName', type: 'text', icon: User },
    { id: 'gender', question: translation.questions.gender, field: 'gender', type: 'select', options: translation.listGenders, icon: User },
    { id: 'birthDate', question: translation.questions.birthDate, field: 'birthDate', type: 'date', icon: Calendar },
    { id: 'civilStatus', question: translation.questions.civilStatus, field: 'civilStatus', type: 'select', options: translation.listCivilStatuses, icon: Heart },
    { id: 'email', question: translation.questions.email, field: 'email', type: 'email', icon: Mail },
    { id: 'phone', question: translation.questions.phone, field: 'phone', type: 'tel', icon: Phone },
    { id: 'address', question: translation.questions.address, field: 'address', type: 'text', icon: MapPin },
    { id: 'nationality', question: translation.questions.nationality, field: 'nationality', type: 'select', options: translation.listNationalities, icon: Globe },
    { id: 'primaryLanguage', question: translation.questions.language, field: 'primaryLanguage', type: 'select', options: translation.listLanguages, icon: Languages },
    { id: 'conversionDate', question: translation.questions.conversionDate, field: 'conversionDate', type: 'date', icon: Sparkles },
    { id: 'baptismDate', question: translation.questions.baptismDate, field: 'baptismDate', type: 'date', icon: Flame },
    { id: 'baptismPlace', question: translation.questions.baptismPlace, field: 'baptismPlace', type: 'text', icon: Map },
    { id: 'photo', question: translation.questions.photo, field: 'photo', type: 'photo', icon: Camera },
  ];

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  const isInputValid = () => {
    const val = formData[current.field];
    // Allow advance if conversion date, baptism date or baptism place are empty (they are optional)
    if (['conversionDate', 'baptismDate', 'baptismPlace'].includes(current.id)) return true;
    
    if (current.type === 'photo') {
      return !!val && !val.toString().includes('unsplash.com/photo-1633332755192-727a05c4013d');
    }
    if (current.type === 'email') return typeof val === 'string' && val.includes('@');
    if (current.type === 'tel') return typeof val === 'string' && val.length > 6;
    return !!val;
  };

  const handleNext = () => {
    if (!isInputValid()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    setShowError(false);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinishing(true);
      setTimeout(() => onComplete(formData), 1500);
    }
  };

  const handleBack = () => {
    setShowError(false);
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 400, 400);
        setFormData(prev => ({ ...prev, photo: compressed }));
        setShowError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const isOptional = ['conversionDate', 'baptismDate', 'baptismPlace'].includes(current.id);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-700 ${isLight ? 'bg-white' : 'bg-black'}`}>
      <div className={`px-6 py-8 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
        <button onClick={handleBack} className={`p-2 rounded-full transition-all active:scale-90 ${isLight ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-white/40'}`}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 px-10">
          <div className={`h-1 w-full rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
            <div 
              className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-end">
           <p className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
             Step {currentStep + 1} / {steps.length}
           </p>
           <p className={`text-[11px] font-black ${isLight ? 'text-blue-600' : 'text-blue-500'}`}>
             {Math.round(progress)}%
           </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-2xl mx-auto w-full overflow-y-auto">
        <div key={current.id} className={`w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ${showError ? 'animate-shake' : ''}`}>
          <div className={`w-20 h-20 rounded-[28px] mx-auto mb-8 flex items-center justify-center shadow-2xl ${isLight ? 'bg-blue-600 text-white' : 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-blue-900/20'}`}>
            <current.icon size={32} className="animate-in zoom-in-50 duration-1000" />
          </div>

          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight mb-4 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {current.question}
            {isOptional && (
              <span className="block text-xs font-bold uppercase tracking-widest text-blue-500 mt-2 opacity-60">(Optional)</span>
            )}
          </h2>

          <div className={`h-12 flex items-center justify-center mb-6 transition-all duration-300 ${showError ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'}`}>
             <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{translation.mandatoryField}</span>
             </div>
          </div>

          <div className="w-full">
            {current.type === 'text' || current.type === 'email' || current.type === 'tel' ? (
              <input 
                autoFocus
                type={current.type}
                value={(formData[current.field] as string) || ''}
                onChange={e => { setFormData({ ...formData, [current.field]: e.target.value }); if(showError) setShowError(false); }}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                className={`w-full text-2xl sm:text-3xl font-bold border-b-4 bg-transparent py-4 text-center focus:outline-none transition-all ${showError ? 'border-red-500' : (isLight ? 'border-slate-100 focus:border-blue-600 text-slate-900' : 'border-white/10 focus:border-blue-600 text-white')}`}
                placeholder="..."
              />
            ) : current.type === 'date' ? (
              <input 
                autoFocus
                type="date"
                value={(formData[current.field] as string) || ''}
                onChange={e => { setFormData({ ...formData, [current.field]: e.target.value }); if(showError) setShowError(false); }}
                className={`w-full text-2xl sm:text-3xl font-bold border-b-4 bg-transparent py-4 text-center focus:outline-none transition-all ${showError ? 'border-red-500' : (isLight ? 'border-slate-100 focus:border-blue-600 text-slate-900' : 'border-white/10 focus:border-blue-600 text-white')}`}
              />
            ) : current.type === 'select' ? (
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm mx-auto">
                {current.options?.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { setFormData({ ...formData, [current.field]: opt }); setShowError(false); setTimeout(handleNext, 400); }}
                    className={`w-full py-5 rounded-[24px] border-2 font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.97] ${
                      formData[current.field] === opt 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                        : (isLight ? 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div 
                  onClick={() => photoRef.current?.click()}
                  className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-[56px] overflow-hidden border-4 cursor-pointer group shadow-2xl transition-transform hover:scale-105 active:scale-95 ${showError ? 'border-red-500 animate-shake' : (isLight ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-white/5')}`}
                >
                  <img src={formData.photo} className="w-full h-full object-cover" alt="Profile Preview" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                  <input type="file" ref={photoRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <p className={`text-xs font-bold ${showError ? 'text-red-500' : (isLight ? 'text-slate-400' : 'text-white/20')}`}>
                  {translation.mandatoryField}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`p-8 sm:p-12 border-t flex justify-center items-center ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
         {current.type !== 'select' && (
           <button 
            onClick={handleNext}
            className={`w-full max-w-[320px] py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${showError ? 'bg-red-600 text-white' : 'bg-blue-600 text-white shadow-blue-600/20'}`}
           >
             {isFinishing ? (
               <><Loader2 className="animate-spin" size={20}/> ...</>
             ) : (
               <>
                 {currentStep === steps.length - 1 ? translation.finish : translation.next}
                 <ArrowRight size={20} />
               </>
             )}
           </button>
         )}
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export const RegistrationSuccess: React.FC<{
  pin: string;
  translation: Translation;
  isLight: boolean;
  onClose: () => void;
}> = ({ pin, translation, isLight, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80 animate-in fade-in duration-1000">
    <div className={`w-full max-w-sm rounded-[56px] p-10 text-center shadow-[0_0_80px_rgba(0,0,0,0.5)] border animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ${isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-white/10'}`}>
       
       <div className="relative mb-8 mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-full h-full rounded-[32px] bg-green-500 flex items-center justify-center shadow-2xl transform rotate-12">
             <Check size={48} className="text-white" />
          </div>
          <div className="absolute -top-4 -right-4">
             <Sparkles className="text-amber-400 animate-bounce" size={28} />
          </div>
       </div>

       <h3 className={`text-2xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
         {translation.registrationSuccess}
       </h3>
       
       <p className="text-sm opacity-50 mb-10 leading-relaxed px-2 font-medium">
         {translation.registrationSuccessSub}
       </p>
       
       <div className={`p-8 rounded-[36px] mb-10 border-4 border-dashed relative group overflow-hidden ${isLight ? 'bg-slate-50 border-blue-200' : 'bg-white/5 border-blue-500/20'}`}>
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-3">{translation.yourPinIs}</p>
          <p className="text-6xl font-black tracking-[0.2em] text-white drop-shadow-lg" style={{ WebkitTextStroke: isLight ? '2px #2563eb' : '0' }}>{pin}</p>
       </div>

       <button 
        onClick={onClose}
        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
       >
         {translation.accessNow}
       </button>

       <p className={`mt-6 text-[10px] font-bold opacity-30 uppercase tracking-widest ${isLight ? 'text-slate-900' : 'text-white'}`}>
         {translation.systemBiometric}
       </p>
    </div>
  </div>
);
