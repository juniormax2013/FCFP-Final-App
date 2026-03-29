
import React from 'react';
import { Cloud, CloudOff, CloudAlert, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { SyncStatus } from '../types';

interface SyncBadgeProps {
  status: SyncStatus;
  isLight: boolean;
  onRetry?: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status, isLight, onRetry }) => {
  const isSyncing = status.status === 'syncing';
  
  const config = {
    match: { icon: <CheckCircle2 className="text-green-500" />, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Sincronizado' },
    pending: { icon: <RefreshCw className="text-amber-500" />, color: 'text-amber-500', bg: 'bg-amber-500/10', label: `${status.pendingCount} pendientes` },
    offline: { icon: <CloudOff className="text-slate-400" />, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Offline' },
    error: { icon: <CloudAlert className="text-red-500" />, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Fallo de Sync' },
    syncing: { icon: <Loader2 className="text-blue-500 animate-spin" />, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Sincronizando...' },
    unconfigured: { icon: <Cloud className="text-slate-300" />, color: 'text-slate-300', bg: 'bg-white/5', label: 'Sin Nube' },
    mismatch: { icon: <CloudAlert className="text-amber-600" />, color: 'text-amber-600', bg: 'bg-amber-600/10', label: 'Inconsistente' }
  }[status.status] || { icon: <Cloud />, color: 'text-slate-400', bg: 'bg-white/5', label: 'Desconocido' };

  return (
    <button 
      onClick={onRetry}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${config.bg} ${isLight ? 'border-slate-100' : 'border-white/5'}`}
    >
      {config.icon}
      <div className="text-left hidden xs:block">
        <p className={`text-[8px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</p>
        <div className="flex items-center gap-1.5">
          {status.lastSyncAt && (
             <p className={`text-[7px] font-medium opacity-40 ${isLight ? 'text-slate-900' : 'text-white'}`}>
               {new Date(status.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </p>
          )}
          {status.receivedCount !== undefined && status.receivedCount > 0 && (
             <p className="text-[7px] font-black text-blue-500">+{status.receivedCount}</p>
          )}
        </div>
      </div>
    </button>
  );
};
