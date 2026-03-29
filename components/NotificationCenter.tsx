
import React, { useState } from 'react';
import { ArrowLeft, Bell, Trash2, CheckCircle, X, ChevronRight, Clock, User, Filter, AlertCircle } from 'lucide-react';
import { Translation, SystemSettings, AppNotification, User as AppUser } from '../types';
import { formatToMMDDYYYY } from '../lib/utils';

interface NotificationCenterProps {
  notifications: AppNotification[];
  currentUser: AppUser;
  isLight: boolean;
  translation: Translation;
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: (type: 'all' | 'read') => void;
  onNavigate?: (url: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, currentUser, isLight, translation, onBack, onMarkAsRead, onDelete, onClearAll, onNavigate
}) => {
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter(n => {
    // Si el usuario la borró, no mostrarla
    if (n.deletedBy?.includes(currentUser.id)) return false;
    
    // Filtrar por destinatario
    const isTarget = 
      n.targetType === 'all' || 
      (n.targetType === 'role' && n.targetId === currentUser.role) ||
      ((n.targetType === 'individual' || n.targetType === 'user' as any) && n.targetId === currentUser.id);
    
    if (!isTarget) return false;
    if (filter === 'unread') return !n.readBy?.includes(currentUser.id);
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = notifications.filter(n => 
    !n.readBy?.includes(currentUser.id) && 
    !n.deletedBy?.includes(currentUser.id) &&
    (n.targetType === 'all' || n.targetId === currentUser.role || n.targetId === currentUser.id)
  ).length;

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`px-6 py-6 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{translation.moduleNames.notifications}</h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-blue-500">{unreadCount} no leídas</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => onClearAll('read')}
            className={`p-2 rounded-xl border transition-all ${isLight ? 'border-slate-200 text-slate-400 hover:text-slate-900' : 'border-white/5 text-white/30 hover:text-white'}`}
            title={translation.notifications.clearRead}
           >
             <CheckCircle size={20}/>
           </button>
           <button 
            onClick={() => onClearAll('all')}
            className={`p-2 rounded-xl border transition-all text-red-500 ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/5 bg-white/5'}`}
            title={translation.notifications.clearAll}
           >
             <Trash2 size={20}/>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          
          <div className="flex gap-2 mb-8">
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'opacity-40'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-blue-600 text-white' : 'opacity-40'}`}>Unread</button>
          </div>

          {filtered.map(n => {
            const isRead = n.readBy?.includes(currentUser.id);
            return (
              <div 
                key={n.id}
                onClick={() => { setSelectedNotification(n); onMarkAsRead(n.id); }}
                className={`p-5 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${isLight ? 'bg-white border-slate-100 hover:border-blue-200' : 'glass border-white/5 hover:bg-white/10'} ${!isRead ? (isLight ? 'bg-blue-50/30' : 'bg-blue-600/5') : ''}`}
              >
                {!isRead && <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={n.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.senderName || 'System')}&background=random`} className="w-12 h-12 rounded-2xl object-cover shadow-md" alt="S" />
                    {!isRead && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white/10 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h4 className={`font-black text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'} ${!isRead ? 'font-black' : 'opacity-70'}`}>{n.title}</h4>
                       <span className="text-[9px] opacity-30 font-bold whitespace-nowrap ml-2">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{n.message}</p>
                    <p className={`text-[8px] uppercase font-black mt-2 tracking-widest opacity-30`}>{translation.notifications.from}: {n.senderName}</p>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-32 text-center opacity-20">
               <Bell size={64} className="mx-auto mb-4" />
               <p className="text-xl font-black italic">{translation.notifications.noNotifications}</p>
            </div>
          )}
        </div>
      </div>

      {selectedNotification && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
           <div className={`w-full max-w-lg rounded-[48px] overflow-hidden flex flex-col border shadow-2xl relative animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
              <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700">
                 <button onClick={() => setSelectedNotification(null)} className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white"><X size={20}/></button>
                 <div className="absolute -bottom-8 left-8">
                    <img src={selectedNotification.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedNotification.senderName || 'System')}&background=random`} className="w-20 h-20 rounded-[28px] border-4 border-[#0a0a0a] object-cover shadow-2xl" alt="P" />
                 </div>
              </div>
              <div className="pt-12 pb-8 px-8 space-y-6">
                 <div>
                    <h3 className={`text-2xl font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedNotification.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 opacity-40">
                          <User size={12}/>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{selectedNotification.senderName}</span>
                       </div>
                       <div className="flex items-center gap-1.5 opacity-40">
                          <Clock size={12}/>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{formatToMMDDYYYY(selectedNotification.timestamp)} {new Date(selectedNotification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </div>
                 </div>

                 <div className={`p-6 rounded-[32px] border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                      {selectedNotification.message}
                    </p>
                 </div>

                 <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/20 text-blue-400'}`}>
                       {translation.notifications.status}: {selectedNotification.readBy?.includes(currentUser.id) ? translation.notifications.read : translation.notifications.unread}
                    </div>
                 </div>

                 <div className="flex gap-3">
                   {selectedNotification.actionUrl && onNavigate && (
                     <button 
                      onClick={() => { onNavigate(selectedNotification.actionUrl!); setSelectedNotification(null); }}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                     >
                       {selectedNotification.actionUrl === 'edit_requests' ? 'View Requests' : 'Go to Module'}
                     </button>
                   )}
                   <button 
                    onClick={() => { onDelete(selectedNotification.id); setSelectedNotification(null); }}
                    className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                   >
                     {translation.delete}
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
