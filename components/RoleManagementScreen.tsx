
import React, { useMemo } from 'react';
import { ArrowLeft, ShieldCheck, UserCheck, Lock, Edit3, Trash2, Info } from 'lucide-react';
import { Translation, SystemSettings } from '../types';

interface RoleManagementScreenProps {
  translation: Translation;
  settings: SystemSettings;
  onBack: () => void;
}

export const RoleManagementScreen: React.FC<RoleManagementScreenProps> = ({ translation, settings, onBack }) => {
  const isLight = settings.theme === 'light';
  
  // Usamos useMemo para evitar re-calculos innecesarios y asegurar acceso seguro a traducciones
  const roles = useMemo(() => {
    const r = translation?.roles || {};
    const rd = translation?.roleDescriptions || {};
    const mn = translation?.moduleNames || {};

    return [
      {
        id: 'admin',
        name: r.admin || 'Administrator',
        color: 'bg-blue-600',
        description: rd.admin || 'Full system access',
        permissions: [translation?.edit, translation?.delete, translation?.apps, translation?.audit].filter(Boolean),
        restriction: translation?.no || 'No'
      },
      {
        id: 'secretaria',
        name: r.secretaria || 'Secretary',
        color: 'bg-emerald-600',
        description: rd.secretaria || 'Member and activity management',
        permissions: [mn.members, mn.tithes, mn.offerings, translation?.edit].filter(Boolean),
        restriction: translation?.roleRestrictions || 'Restricted'
      },
      {
        id: 'contable',
        name: r.contable || 'Accountant',
        color: 'bg-amber-600',
        description: rd.contable || 'Financial management and reports',
        permissions: [mn.tithes, mn.expenses, mn.analytics].filter(Boolean),
        restriction: translation?.roleRestrictions || 'Restricted'
      }
    ];
  }, [translation]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${isLight ? 'bg-white/80 border-b border-slate-200' : 'bg-black/80 border-b border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-blue-500" /> {translation?.roleManagement || 'Gestión de Roles'}
            </h2>
            <p className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{translation?.securityHierarchy || 'Jerarquía de Seguridad'}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 gap-8">
          {roles.map((role) => (
            <div key={role.id} className={`rounded-[40px] p-8 border relative overflow-hidden group transition-all shadow-lg ${isLight ? 'bg-white border-slate-100' : 'glass border-white/5 group-hover:border-white/10'}`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                   <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${role.color} flex items-center justify-center shadow-2xl`}>
                         <ShieldCheck size={28} className="text-white" />
                      </div>
                      <div>
                         <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{role.name}</h3>
                         <p className={`text-xs font-medium italic ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{role.description}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className={`p-6 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                         <h4 className={`text-[10px] uppercase font-black tracking-[0.2em] mb-4 flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                           <UserCheck size={14}/> {translation?.rolePermissions || 'Permisos'}
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {role.permissions.map((p, i) => (
                               <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold ${isLight ? 'bg-white text-slate-500 shadow-sm' : 'bg-white/5 text-white/60'}`}>
                                  {p}
                               </span>
                            ))}
                         </div>
                      </div>
                      
                      <div className={`p-6 rounded-3xl border ${isLight ? 'bg-rose-50/50 border-rose-100' : 'bg-white/5 border-white/5'}`}>
                         <h4 className={`text-[10px] uppercase font-black tracking-[0.2em] mb-4 flex items-center gap-2 ${isLight ? 'text-rose-400' : 'text-red-400/50'}`}>
                           <Lock size={14}/> {translation?.roleRestrictions || 'Restricciones'}
                         </h4>
                         <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{role.restriction}</p>
                      </div>
                   </div>
                </div>

                <div className="md:w-64 flex flex-col gap-4">
                   <div className={`p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-inner ${isLight ? 'bg-slate-50' : 'glass'}`}>
                      <p className={`text-[10px] uppercase font-black mb-2 ${isLight ? 'text-slate-300' : 'text-white/30'}`}>{translation?.activeUsers || 'Usuarios Activos'}</p>
                      <span className="text-4xl font-black text-blue-500">--</span>
                   </div>
                   <button className={`w-full py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${isLight ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                      {translation?.viewMembers || 'View Members'}
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-12 p-10 rounded-[40px] border-dashed border-2 text-center ${isLight ? 'bg-slate-100 border-slate-200' : 'glass border-white/5'}`}>
            <Info size={40} className={`mx-auto mb-4 ${isLight ? 'text-slate-300' : 'text-white/10'}`} />
            <h4 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-600' : 'text-white/80'}`}>{translation?.specialConfig || 'Configuración Especial'}</h4>
            <p className={`text-sm max-w-md mx-auto ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
               {translation?.superUserNotice || 'Las propiedades de superusuario están protegidas.'}
            </p>
        </div>
      </div>
    </div>
  );
};
