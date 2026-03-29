
import React, { useState, useMemo } from 'react';
import { X, Send, Users, User, Shield, Globe, Search, Check } from 'lucide-react';
import { Translation, SystemSettings, User as AppUser, Member, AppNotification } from '../types';

interface SendNotificationModalProps {
  onClose: () => void;
  onSend: (n: Omit<AppNotification, 'id' | 'timestamp' | 'readBy' | 'deletedBy'>) => void;
  isLight: boolean;
  translation: Translation;
  currentUser: AppUser;
  members: Member[];
  users: AppUser[];
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ 
  onClose, onSend, isLight, translation, currentUser, members, users 
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'role' | 'individual'>('all');
  const [targetId, setTargetId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 5);
  }, [memberSearch, members]);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    if (targetType === 'individual' && !targetId) return;
    if (targetType === 'role' && !targetId) return;

    onSend({
      title,
      message,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderPhoto: currentUser.photo,
      targetType,
      targetId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
      <div className={`w-full max-w-lg rounded-[48px] overflow-hidden flex flex-col border shadow-2xl relative animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{translation.notifications.newNotification}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 opacity-50"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{translation.notifications.sendTo}</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setTargetType('all')}
                className={`py-3 rounded-2xl border text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${targetType === 'all' ? 'bg-blue-600 text-white border-blue-600' : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5 opacity-40')}`}
              >
                <Globe size={16}/> {translation.notifications.global}
              </button>
              <button 
                onClick={() => setTargetType('role')}
                className={`py-3 rounded-2xl border text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${targetType === 'role' ? 'bg-purple-600 text-white border-purple-600' : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5 opacity-40')}`}
              >
                <Shield size={16}/> {translation.notifications.roles}
              </button>
              <button 
                onClick={() => setTargetType('individual')}
                className={`py-3 rounded-2xl border text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${targetType === 'individual' ? 'bg-emerald-600 text-white border-emerald-600' : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5 opacity-40')}`}
              >
                <User size={16}/> {translation.notifications.members}
              </button>
            </div>
          </div>

          {targetType === 'role' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <select 
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
              >
                <option value="">Seleccionar Rol...</option>
                <option value="admin">Administradores</option>
                <option value="contable">Contables</option>
                <option value="secretaria">Secretarias</option>
              </select>
            </div>
          )}

          {targetType === 'individual' && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                  type="text" 
                  placeholder="Search member..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className={`w-full border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
                />
                {filteredMembers.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl overflow-hidden shadow-2xl z-50 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                    {filteredMembers.map(m => (
                      <button key={m.id} onClick={() => { setTargetId(m.id); setMemberSearch(`${m.firstName} ${m.lastName}`); }} className="w-full flex items-center gap-3 p-3 hover:bg-blue-500/10 text-left border-b last:border-0 border-white/5">
                        <img src={m.photo} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-xs font-bold">{m.firstName} {m.lastName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Asunto / Título"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
            />
            <textarea 
              rows={4}
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className={`w-full border rounded-3xl px-4 py-4 text-sm focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
            />
          </div>
        </div>

        <div className="p-8 border-t border-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-bold opacity-50">{translation.cancel}</button>
          <button 
            onClick={handleSend}
            disabled={!title.trim() || !message.trim()}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Send size={16}/> {translation.send}
          </button>
        </div>
      </div>
    </div>
  );
};
