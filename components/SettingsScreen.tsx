
import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, ShieldCheck, Image as ImageIcon, 
  Check, Globe, Database, FileJson, 
  HardDriveDownload, HardDriveUpload, Camera, UserPlus, 
  Settings, Loader2, Sparkles, AlertCircle, X,
  LayoutGrid, Users, Calendar, DollarSign, Wallet, HeartHandshake, 
  ReceiptText, MessageSquareHeart, BarChart3, Cake, LayoutPanelTop, QrCode, Tag, Heart, Flame, Briefcase, UserCheck, Layers, ListTree, Map, Navigation, MessageCircle, IdCard, UserCheck2, KeyRound, CreditCard
} from 'lucide-react';
import { SystemSettings, Translation, Language, SyncStatus, User } from '../types.ts';
import { SyncBadge } from './SyncBadge.tsx';
import { compressImage } from '../lib/utils.ts';

const Section = ({ title, icon: Icon, children, isLight }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon size={14} className="text-blue-500" />
      <h3 className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{title}</h3>
    </div>
    <div className={`p-5 sm:p-8 ${isLight ? 'bg-white shadow-lg border border-slate-100' : 'bg-white/5 border border-white/5'} rounded-[32px] sm:rounded-[40px] space-y-6 sm:space-y-8`}>
      {children}
    </div>
  </div>
);

const ModuleToggle = ({ icon: Icon, label, enabled, onToggle, isLight }: any) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${enabled ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'} transition-colors`}>
        <Icon size={18} />
      </div>
      <p className={`text-xs font-bold ${enabled ? '' : 'opacity-40'} transition-opacity`}>{label}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${enabled ? 'bg-blue-600' : (isLight ? 'bg-slate-200' : 'bg-white/10')}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${enabled ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

const SuccessAnimation3D = ({ isLight, onClose }: any) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60 animate-in fade-in duration-500">
    <div className={`w-full max-w-sm rounded-[48px] p-10 text-center shadow-[0_0_80px_rgba(0,0,0,0.5)] border animate-in zoom-in-95 duration-500 flex flex-col items-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
       <div className="perspective-[1000px] mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_rgba(34,197,94,0.4)] transform rotate-X-12 animate-bounce">
             <Check size={48} className="text-white drop-shadow-lg" />
          </div>
       </div>
       <h3 className={`text-2xl font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>¡Éxito!</h3>
       <p className="text-sm opacity-50 mb-10 leading-relaxed px-4">La información ha sido importada correctamente a la base de datos.</p>
       <button onClick={onClose} className="w-full py-4 bg-green-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Genial</button>
    </div>
  </div>
);

interface SettingsScreenProps {
  settings: SystemSettings;
  translation: Translation;
  currentLang: Language;
  syncStatus: SyncStatus;
  onBack: () => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onUpdateLang: (lang: Language) => void;
  localData: Record<string, any[]>;
  onBatchUpdate: (tableName: string, data: any[]) => Promise<boolean>;
  currentUser: User;
}

import { getLocalYYYYMMDD } from '../lib/utils';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  settings, translation, currentLang, syncStatus, onBack, onUpdateSettings, onUpdateLang, localData, onBatchUpdate, currentUser
}) => {
  const isLight = settings.theme === 'light';
  const isSuperUser = currentUser.id === '1';
  const logoInputRef = useRef<HTMLInputElement>(null);

  // States for Import/Export logic
  const [targetTable, setTargetTable] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<any[] | null>(null);

  const tables = [
    { id: 'countries', label: translation.countries, icon: Globe },
    { id: 'provinces', label: translation.provinces, icon: Database },
    { id: 'cities', label: translation.cities, icon: Database },
    { id: 'civil_statuses', label: translation.civilStatus, icon: ShieldCheck },
    { id: 'nationalities', label: translation.nationalities, icon: Globe },
    { id: 'member_languages', label: translation.languages, icon: Globe },
    { id: 'spiritual_statuses', label: translation.spiritualStatus, icon: ShieldCheck },
    { id: 'departments', label: translation.departments, icon: ShieldCheck },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 250, 250);
        onUpdateSettings({ ...settings, systemLogo: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (tableId: string, label: string) => {
    const data = localData[tableId] || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Export_${label.replace(/\s+/g, '_')}_${getLocalYYYYMMDD()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const validateJson = (data: any, tableId: string): boolean => {
    if (!Array.isArray(data)) return false;
    if (['countries', 'provinces', 'cities'].includes(tableId)) {
      return data.every(item => typeof item === 'object' && item.name);
    }
    return data.every(item => typeof item === 'string');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, tableId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (validateJson(json, tableId)) {
          setPendingData(json);
          setTargetTable(tableId);
          setValidationError(null);
        } else {
          setValidationError(`El archivo JSON no coincide con el formato esperado para "${tableId}".`);
          setPendingData(null);
        }
      } catch (err) {
        setValidationError("Archivo JSON inválido o mal formado.");
        setPendingData(null);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!targetTable || !pendingData) return;
    setIsSyncing(true);
    const success = await onBatchUpdate(targetTable, pendingData);
    setIsSyncing(false);
    if (success) {
      setShowSuccess(true);
      setPendingData(null);
      setTargetTable(null);
    } else {
      alert("Error al subir los datos a Firebase.");
    }
  };

  const toggleModule = (moduleKey: keyof SystemSettings['enabledModules']) => {
    onUpdateSettings({
      ...settings,
      enabledModules: {
        ...settings.enabledModules,
        [moduleKey]: !settings.enabledModules[moduleKey]
      }
    });
  };

  return (
    <div className={`h-screen w-full ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'} flex flex-col overflow-y-auto pb-32 scroll-smooth`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between sticky top-0 z-40 ${isLight ? 'bg-white/80' : 'bg-black/80'} backdrop-blur-md border-b ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/5'} transition-colors`}><ArrowLeft size={20} /></button>
          <h2 className="text-lg font-bold flex items-center gap-2"><Settings size={18} className="text-blue-500" /> {translation.settings}</h2>
        </div>
        <SyncBadge status={syncStatus} isLight={isLight} />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mt-6 space-y-10">
        
        {/* IDENTIDAD DEL SISTEMA */}
        <Section title={translation.systemIdentity} icon={ShieldCheck} isLight={isLight}>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div 
                onClick={() => logoInputRef.current?.click()}
                className={`relative w-24 h-24 rounded-[30px] overflow-hidden border-4 cursor-pointer group shadow-xl transition-all hover:scale-105 active:scale-95 ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-white/5'}`}
              >
                {settings.systemLogo ? (
                  <img src={settings.systemLogo} className="w-full h-full object-contain p-2" alt="Logo" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={40} /></div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
              </div>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
              
              {settings.systemLogo && (
                <button
                  onClick={() => onUpdateSettings({ ...settings, systemLogo: null })}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${isLight ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-red-400 bg-red-400/10 hover:bg-red-400/20'}`}
                >
                  Restablecer logo por defecto
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation.systemName}</label>
              <input 
                type="text" 
                value={settings.systemName}
                onChange={(e) => onUpdateSettings({ ...settings, systemName: e.target.value })}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
              />
            </div>

            <div className="space-y-2 pt-2">
               <ModuleToggle 
                 icon={UserPlus} 
                 label="Permitir Auto-Registro (Login)" 
                 enabled={settings.allowMemberRegistration} 
                 onToggle={() => onUpdateSettings({ ...settings, allowMemberRegistration: !settings.allowMemberRegistration })} 
                 isLight={isLight} 
               />
               
               {isSuperUser && (
                 <div className="mt-4 animate-in fade-in duration-500">
                    <ModuleToggle 
                      icon={KeyRound} 
                      label="Mostrar PIN al finalizar registro" 
                      enabled={settings.showRegistrationPin} 
                      onToggle={() => onUpdateSettings({ ...settings, showRegistrationPin: !settings.showRegistrationPin })} 
                      isLight={isLight} 
                    />
                    <p className={`text-[8px] font-bold uppercase tracking-tighter mt-1 px-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                       * Solo el Super Usuario puede ver y cambiar este ajuste de seguridad.
                    </p>
                 </div>
               )}
            </div>
          </div>
        </Section>

        {/* FACTURACIÓN Y PLAN (SOLO SUPER USER) */}
        {isSuperUser && (
          <Section title="Facturación y Plan" icon={CreditCard} isLight={isLight}>
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-500/20'}`}>
                <h4 className="text-lg font-black mb-2 flex items-center gap-2">
                  <Sparkles className="text-blue-500" size={20} />
                  Plan Premium
                </h4>
                <p className={`text-sm mb-4 leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                  Plataforma integral para la gestión de iglesias y ministerios.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-white/70'}`}>Gestión de miembros, control de asistencia, finanzas, calendario de actividades y más.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-white/70'}`}>Acceso desde cualquier dispositivo, datos seguros en la nube, soporte técnico.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-white/70'}`}>Actualizaciones continuas y nuevas funciones sin costo adicional.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="https://buy.stripe.com/5kQaEY7MafCrbFBagN2Fa01" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    Pagar Plan
                  </a>
                  
                  {settings.planStatus === 'active' && (
                    <button 
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que deseas cancelar tu plan? Perderás acceso a las funciones premium al finalizar tu ciclo actual.')) {
                          onUpdateSettings({ ...settings, planStatus: 'inactive' });
                        }
                      }}
                      className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all text-center border ${isLight ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}
                    >
                      Cancelar Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* GESTIÓN DE MÓDULOS (SOLO SUPER USER) */}
        {isSuperUser && (
          <Section title="Gestión de Aplicaciones" icon={LayoutGrid} isLight={isLight}>
            <div className="space-y-2">
              <p className="text-[10px] opacity-50 px-1 mb-4 italic">Activa o desactiva las funciones principales del sistema.</p>
              <div className="grid grid-cols-1 gap-3">
                <ModuleToggle icon={Users} label={translation.moduleNames.members} enabled={settings.enabledModules.members} onToggle={() => toggleModule('members')} isLight={isLight} />
                <ModuleToggle icon={Calendar} label={translation.moduleNames.activities} enabled={settings.enabledModules.activities} onToggle={() => toggleModule('activities')} isLight={isLight} />
                <ModuleToggle icon={Calendar} label={translation.moduleNames.calendar} enabled={settings.enabledModules.calendar} onToggle={() => toggleModule('calendar')} isLight={isLight} />
                <ModuleToggle icon={QrCode} label={translation.moduleNames.attendanceCommunion} enabled={settings.enabledModules.attendanceCommunion} onToggle={() => toggleModule('attendanceCommunion')} isLight={isLight} />
                <ModuleToggle icon={LayoutPanelTop} label={translation.moduleNames.committee} enabled={settings.enabledModules.committee} onToggle={() => toggleModule('committee')} isLight={isLight} />
                <ModuleToggle icon={BarChart3} label={translation.moduleNames.analytics} enabled={settings.enabledModules.analytics} onToggle={() => toggleModule('analytics')} isLight={isLight} />
                <ModuleToggle icon={Cake} label={translation.moduleNames.birthdays} enabled={settings.enabledModules.birthdays} onToggle={() => toggleModule('birthdays')} isLight={isLight} />
                <ModuleToggle icon={MessageSquareHeart} label={translation.moduleNames.prayers} enabled={settings.enabledModules.prayers} onToggle={() => toggleModule('prayers')} isLight={isLight} />
                <ModuleToggle icon={DollarSign} label={translation.moduleNames.tithes} enabled={settings.enabledModules.tithes} onToggle={() => toggleModule('tithes')} isLight={isLight} />
                <ModuleToggle icon={Wallet} label={translation.moduleNames.offerings} enabled={settings.enabledModules.offerings} onToggle={() => toggleModule('offerings')} isLight={isLight} />
                <ModuleToggle icon={HeartHandshake} label={translation.moduleNames.donations} enabled={settings.enabledModules.donations} onToggle={() => toggleModule('donations')} isLight={isLight} />
                <ModuleToggle icon={ReceiptText} label={translation.moduleNames.expenses} enabled={settings.enabledModules.expenses} onToggle={() => toggleModule('expenses')} isLight={isLight} />
              </div>
            </div>
          </Section>
        )}

        {/* GESTIÓN DE CONFIGURACIONES MAESTRAS (SOLO SUPER USER) */}
        {isSuperUser && (
          <Section title="Gestión de Catálogos" icon={Database} isLight={isLight}>
            <div className="space-y-2">
              <p className="text-[10px] opacity-50 px-1 mb-4 italic">Habilita o deshabilita el acceso a las pantallas de configuración de catálogos.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModuleToggle icon={IdCard} label={translation.moduleNames.idTypes} enabled={settings.enabledModules.idTypes} onToggle={() => toggleModule('idTypes')} isLight={isLight} />
                <ModuleToggle icon={Globe} label={translation.countries} enabled={settings.enabledModules.countries} onToggle={() => toggleModule('countries')} isLight={isLight} />
                <ModuleToggle icon={Map} label={translation.provinces} enabled={settings.enabledModules.provinces} onToggle={() => toggleModule('provinces')} isLight={isLight} />
                <ModuleToggle icon={Navigation} label={translation.cities} enabled={settings.enabledModules.cities} onToggle={() => toggleModule('cities')} isLight={isLight} />
                <ModuleToggle icon={Heart} label={translation.civilStatus} enabled={settings.enabledModules.civilStatus} onToggle={() => toggleModule('civilStatus')} isLight={isLight} />
                <ModuleToggle icon={Globe} label={translation.nationalities} enabled={settings.enabledModules.nationalities} onToggle={() => toggleModule('nationalities')} isLight={isLight} />
                <ModuleToggle icon={MessageCircle} label={translation.languages} enabled={settings.enabledModules.languages} onToggle={() => toggleModule('languages')} isLight={isLight} />
                <ModuleToggle icon={Flame} label={translation.spiritualStatus} enabled={settings.enabledModules.spiritualStatus} onToggle={() => toggleModule('spiritualStatus')} isLight={isLight} />
                <ModuleToggle icon={Tag} label={translation.memberType} enabled={settings.enabledModules.memberTypes} onToggle={() => toggleModule('memberTypes')} isLight={isLight} />
                <ModuleToggle icon={Briefcase} label={translation.departments} enabled={settings.enabledModules.departments} onToggle={() => toggleModule('departments')} isLight={isLight} />
                <ModuleToggle icon={Heart} label={translation.spouseRelationshipTypes} enabled={settings.enabledModules.spouseRelationshipTypes} onToggle={() => toggleModule('spouseRelationshipTypes')} isLight={isLight} />
                <ModuleToggle icon={Users} label={translation.userManagement} enabled={settings.enabledModules.userManagement} onToggle={() => toggleModule('userManagement')} isLight={isLight} />
                <ModuleToggle icon={ShieldCheck} label={translation.roleManagement} enabled={settings.enabledModules.roleManagement} onToggle={() => toggleModule('roleManagement')} isLight={isLight} />
                <ModuleToggle icon={ListTree} label={translation.expenseCategories} enabled={settings.enabledModules.expenseCategories} onToggle={() => toggleModule('expenseCategories')} isLight={isLight} />
                <ModuleToggle icon={UserPlus} label={translation.committeeRoles} enabled={settings.enabledModules.committeeRoles} onToggle={() => toggleModule('committeeRoles')} isLight={isLight} />
                <ModuleToggle icon={Layers} label={translation.committeeTypes} enabled={settings.enabledModules.committeeTypes} onToggle={() => toggleModule('committeeTypes')} isLight={isLight} />
              </div>
            </div>
          </Section>
        )}

        {/* GESTIÓN DE DATOS MAESTROS (IMPORT/EXPORT) */}
        <Section title="Gestión de Datos Maestros" icon={FileJson} isLight={isLight}>
           <div className="space-y-4">
              <p className="text-xs opacity-50 px-1 mb-2 italic">Importa o exporta archivos JSON de forma individual por categoría.</p>
              {tables.map(table => (
                <div key={table.id} className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${isLight ? 'bg-slate-50 border-slate-100 hover:bg-slate-100' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><table.icon size={18} /></div>
                      <p className="text-xs font-bold">{table.label}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExport(table.id, table.label)}
                        className={`p-2 rounded-xl transition-all ${isLight ? 'text-slate-400 hover:text-blue-600' : 'text-white/30 hover:text-blue-400'}`}
                        title="Exportar JSON"
                      >
                         <HardDriveDownload size={18} />
                      </button>
                      <label className={`p-2 rounded-xl cursor-pointer transition-all ${isLight ? 'text-slate-400 hover:text-emerald-600' : 'text-white/30 hover:text-emerald-400'}`} title="Importar JSON">
                         <HardDriveUpload size={18} />
                         <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileSelect(e, table.id)} />
                      </label>
                   </div>
                </div>
              ))}
           </div>
        </Section>

        {/* PANELES DE ACCIÓN PARA IMPORTACIÓN PENDIENTE */}
        {targetTable && pendingData && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm z-50 px-4">
             <div className={`p-6 rounded-[32px] border shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col gap-4 ${isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-emerald-500/30'}`}>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500 rounded-xl text-white"><Sparkles size={20}/></div>
                   <div>
                      <h4 className="text-sm font-black uppercase">Validated File</h4>
                      <p className="text-[10px] opacity-50">Ready to import to: <b>{tables.find(t => t.id === targetTable)?.label}</b></p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setPendingData(null); setTargetTable(null); }} className="flex-1 py-3 text-xs font-bold opacity-50">{translation.cancel}</button>
                   <button onClick={confirmImport} className="flex-[2] py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Import Now</button>
                </div>
             </div>
          </div>
        )}

        {validationError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in">
             <AlertCircle className="text-red-500" size={20} />
             <p className="text-xs text-red-500 font-medium flex-1">{validationError}</p>
             <button onClick={() => setValidationError(null)}><X size={14} className="text-red-500" /></button>
          </div>
        )}
      </div>

      {/* OVERLAYS DE ESTADO */}
      {isSyncing && (
        <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center backdrop-blur-xl bg-black/40">
           <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-6" />
           <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Sincronizando Firebase...</p>
        </div>
      )}

      {showSuccess && <SuccessAnimation3D isLight={isLight} onClose={() => setShowSuccess(false)} />}
    </div>
  );
};
