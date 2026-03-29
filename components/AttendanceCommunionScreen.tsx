
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, QrCode, Check, X, Search, Filter, Users, UserCheck, 
  ShieldAlert, Calendar, Clock, ChevronRight, LayoutGrid, ListFilter, 
  AlertTriangle, PlayCircle, StopCircle, RefreshCw, Keyboard, History, 
  BookOpen, User as UserIcon, TrendingUp, ChevronDown, Trash2
} from 'lucide-react';
import { User, Translation, Member, Activity, SystemSettings, AttendanceRecord, CommunionRecord } from '../types';
import { formatToMMDDYYYY, getLocalYYYYMMDD } from '../lib/utils';
import { QRScanner } from './QRScanner';

interface AttendanceCommunionScreenProps {
  currentUser: User; 
  translation: Translation; 
  settings: SystemSettings; 
  members: Member[]; 
  activities: Activity[]; 
  attendanceRecords: AttendanceRecord[]; 
  communionRecords: CommunionRecord[]; 
  attendanceRegistryActive: Record<string, boolean>; 
  onBack: () => void; 
  onAddAttendance: (r: AttendanceRecord) => void; 
  onAddCommunion: (r: CommunionRecord) => void; 
  onDeleteAttendance: (id: string) => void;
  onDeleteCommunion: (id: string) => void;
  onToggleAttendanceRegistry: (eventId: string, status: boolean) => void; 
  onUpdateMember: (m: Member) => void;
  isRestricted: boolean;
}

export const AttendanceCommunionScreen: React.FC<AttendanceCommunionScreenProps> = ({ 
  currentUser, translation, settings, members, activities, attendanceRecords, 
  communionRecords, attendanceRegistryActive, onBack, onAddAttendance, 
  onAddCommunion, onDeleteAttendance, onDeleteCommunion, onToggleAttendanceRegistry, onUpdateMember, isRestricted 
}) => {
  const [mode, setMode] = useState<'asistencia' | 'santacena'>('asistencia');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualId, setManualId] = useState('');
  const [showToast, setShowToast] = useState<string | null>(null);

  const isLight = settings.theme === 'light';
  const isSuperUser = currentUser.id === '1';
  const todayStr = getLocalYYYYMMDD();

  const activeActivities = useMemo(() => 
    activities.filter(a => a.status === 'Active' || a.status === 'Ongoing')
  , [activities]);

  const selectedEvent = useMemo(() => 
    activities.find(a => a.id === selectedEventId)
  , [activities, selectedEventId]);

  const isRegistrationOpen = selectedEventId ? (attendanceRegistryActive[selectedEventId] ?? true) : false;

  const currentEventAttendees = useMemo(() => {
    if (mode === 'asistencia') {
      const eventRecords = attendanceRecords.filter(r => r.eventId === selectedEventId);
      return eventRecords.map(record => {
        const member = members.find(m => m.id === record.memberId);
        return {
          ...record,
          photo: member?.photo || '',
          gender: member?.gender || 'N/A'
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      const eventRecords = communionRecords.filter(r => r.date === todayStr);
      return eventRecords.map(record => {
        const member = members.find(m => m.id === record.memberId);
        return {
          ...record,
          photo: member?.photo || '',
          gender: member?.gender || 'N/A'
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }, [mode, selectedEventId, attendanceRecords, communionRecords, todayStr, members]);

  const stats = useMemo(() => {
    const total = currentEventAttendees.length;
    const men = currentEventAttendees.filter(a => a.gender === 'Masculino').length;
    const women = currentEventAttendees.filter(a => a.gender === 'Femenino').length;
    return { total, men, women };
  }, [currentEventAttendees]);

  const handleScan = (scannedId: string) => {
    const member = members.find(m => m.id === scannedId || m.pin === scannedId);
    
    if (!member) {
      alert("ID Error: " + scannedId);
      return;
    }

    if (!member.isActive) {
      alert(translation.errorMemberInactive || "Inactive member");
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    if (mode === 'asistencia') {
      if (!selectedEventId) return;
      
      const alreadyRegistered = attendanceRecords.some(r => r.memberId === member.id && r.eventId === selectedEventId);
      if (alreadyRegistered) {
        alert(`${member.firstName} registered.`);
        return;
      }

      onAddAttendance({
        id: `ATT-${Date.now()}`,
        eventId: selectedEventId,
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        timestamp: timestamp
      });
      
      triggerToast(`Check-in: ${member.firstName}`);
    } else {
      const alreadyRegistered = communionRecords.some(r => r.memberId === member.id && r.date === todayStr);
      if (alreadyRegistered) {
        alert(`${member.firstName} already took part today.`);
        return;
      }

      onAddCommunion({
        id: `COM-${Date.now()}`,
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        date: todayStr,
        timestamp: timestamp
      });

      triggerToast(`${translation.holyCommunion}: ${member.firstName}`);
    }
    
    setIsScannerOpen(false);
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleManualConfirm = () => {
    if (manualId.trim()) {
      handleScan(manualId.trim());
      setManualId('');
      setShowManualInput(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (!confirm(translation.confirmAction)) return;
    if (mode === 'asistencia') {
      onDeleteAttendance(id);
    } else {
      onDeleteCommunion(id);
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <Check size={20} />
            <p className="font-black uppercase text-xs tracking-widest">{showToast}</p>
          </div>
        </div>
      )}

      <div className={`px-6 py-6 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-white'}`}><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-black tracking-tight">{translation.moduleNames.attendanceCommunion}</h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-blue-500">{translation.attendanceControl}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
          
          <div className={`flex p-1 rounded-[24px] border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
            <button onClick={() => { setMode('asistencia'); setSelectedEventId(null); }} className={`flex-1 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${mode === 'asistencia' ? 'bg-blue-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>
              <Users size={16} className="inline mr-2" /> {translation.attendance}
            </button>
            <button onClick={() => setMode('santacena')} className={`flex-1 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${mode === 'santacena' ? 'bg-purple-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>
              <BookOpen size={16} className="inline mr-2" /> {translation.holyCommunion}
            </button>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {mode === 'asistencia' ? (
              !selectedEventId ? (
                <div className={`p-8 rounded-[48px] border shadow-xl ${isLight ? 'bg-white border-slate-100' : 'glass border-white/5'}`}>
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Calendar className="text-blue-500" /> {translation.selectActiveEvent}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {activeActivities.length > 0 ? activeActivities.map(a => (
                      <button key={a.id} onClick={() => setSelectedEventId(a.id)} className={`w-full flex items-center justify-between p-6 rounded-[32px] border transition-all ${isLight ? 'bg-slate-50 border-slate-100 hover:border-blue-300' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                            <Clock size={24}/>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-base">{a.title}</p>
                            <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{formatToMMDDYYYY(a.time)} {new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="opacity-20" />
                      </button>
                    )) : (
                      <div className="py-12 text-center opacity-20">
                        <AlertTriangle size={48} className="mx-auto mb-4" />
                        <p className="font-bold uppercase text-xs">{translation.noActiveEvents}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-8 rounded-[48px] border shadow-2xl relative overflow-hidden ${isLight ? 'bg-white border-slate-100' : 'glass border-white/5'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isRegistrationOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isRegistrationOpen ? 'text-green-500' : 'text-red-500'}`}>
                            {isRegistrationOpen ? translation.registrationOpen : translation.registrationClosed}
                          </p>
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter">{selectedEvent?.title}</h3>
                        <p className="text-xs opacity-40 mt-1 font-bold">{selectedEvent?.address}</p>
                      </div>
                      <button onClick={() => setSelectedEventId(null)} className={`px-5 py-2.5 border rounded-2xl text-[10px] font-black uppercase tracking-widest ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>{translation.changingEvent}</button>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <button onClick={() => setIsScannerOpen(true)} className="w-full max-w-sm py-8 bg-blue-600 text-white rounded-[40px] flex flex-col items-center gap-4 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all group">
                        <div className="p-4 bg-white/20 rounded-3xl group-hover:scale-110 transition-transform">
                          <QrCode size={56} />
                        </div>
                        <span className="font-black uppercase text-base tracking-[0.2em]">{translation.scanQr}</span>
                      </button>
                      <button onClick={() => setShowManualInput(true)} className="text-[10px] font-black uppercase tracking-[0.3em] border px-8 py-3 rounded-full opacity-40 hover:opacity-100 transition-opacity">
                        {translation.manualEntry}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-6 rounded-[32px] border text-center ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <p className="text-[9px] font-black uppercase opacity-40 mb-1">{translation.participants}</p>
                      <p className="text-2xl font-black text-blue-500">{stats.total}</p>
                    </div>
                    <div className={`p-6 rounded-[32px] border text-center ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <p className="text-[9px] font-black uppercase opacity-40 mb-1">{translation.male}</p>
                      <p className="text-2xl font-black text-cyan-500">{stats.men}</p>
                    </div>
                    <div className={`p-6 rounded-[32px] border text-center ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <p className="text-[9px] font-black uppercase opacity-40 mb-1">{translation.female}</p>
                      <p className="text-2xl font-black text-pink-500">{stats.women}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-2">
                         <History size={14} /> {translation.attendanceHistory}
                       </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {currentEventAttendees.map((att) => (
                        <div key={att.id} className={`flex items-center justify-between p-4 rounded-[28px] border animate-in slide-in-from-right-4 duration-300 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                          <div className="flex items-center gap-4">
                            <img src={att.photo || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-2xl object-cover shadow-md border border-white/10" alt="P" />
                            <div>
                              <p className="font-black text-sm">{att.memberName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase ${att.gender === 'Masculino' ? 'text-cyan-500' : 'text-pink-500'}`}>
                                  {att.gender}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[9px] font-bold opacity-40 uppercase">{att.memberId}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <p className="text-[10px] font-black opacity-40 flex items-center gap-1.5 justify-end">
                               <Clock size={10} /> {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                             {isSuperUser && (
                               <button 
                                 onClick={() => handleDeleteRecord(att.id)}
                                 className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                               >
                                 <Trash2 size={14} />
                               </button>
                             )}
                          </div>
                        </div>
                      ))}
                      {currentEventAttendees.length === 0 && (
                        <div className="py-20 text-center opacity-20 italic">
                          <UserIcon size={48} className="mx-auto mb-4" />
                          <p className="text-sm font-black uppercase tracking-widest">{translation.noAttendeesYet}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-8">
                <div className={`p-8 rounded-[48px] border shadow-2xl relative overflow-hidden ${isLight ? 'bg-white border-slate-100' : 'glass border-white/5'}`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 text-center sm:text-left">
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter">{translation.holyCommunion}</h3>
                      <p className="text-xs opacity-40 mt-1 font-bold italic">{translation.today}: {formatToMMDDYYYY(new Date())}</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                       <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">{translation.status}: {translation.active}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6">
                    <button onClick={() => setIsScannerOpen(true)} className="w-full max-w-sm py-8 bg-purple-600 text-white rounded-[40px] flex flex-col items-center gap-4 shadow-2xl shadow-purple-600/30 active:scale-95 transition-all group">
                      <div className="p-4 bg-white/20 rounded-3xl group-hover:scale-110 transition-transform">
                        <QrCode size={56} />
                      </div>
                      <span className="font-black uppercase text-base tracking-[0.2em]">{translation.scanQr}</span>
                    </button>
                    <button onClick={() => setShowManualInput(true)} className="text-[10px] font-black uppercase tracking-[0.3em] border px-8 py-3 rounded-full opacity-40 hover:opacity-100 transition-opacity">
                      {translation.manualEntry}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-2">
                       <Check size={14} /> {translation.participants} ({currentEventAttendees.length})
                     </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentEventAttendees.map((com) => (
                      <div key={com.id} className={`flex items-center justify-between p-4 rounded-[28px] border animate-in zoom-in-95 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <img src={com.photo || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-2xl object-cover" alt="P" />
                          <div className="min-w-0">
                            <p className="font-black text-sm truncate">{com.memberName}</p>
                            <p className="text-[9px] font-bold opacity-40 uppercase">{new Date(com.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {isSuperUser && (
                           <button 
                             onClick={() => handleDeleteRecord(com.id)}
                             className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                           >
                             <Trash2 size={16} />
                           </button>
                        )}
                      </div>
                    ))}
                    {currentEventAttendees.length === 0 && (
                      <div className="col-span-full py-20 text-center opacity-20">
                        <AlertTriangle size={48} className="mx-auto mb-4" />
                        <p className="font-bold uppercase text-xs">Sin registros de Santa Cena para hoy</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isScannerOpen && (
        <QRScanner 
          isLight={isLight} 
          title={translation.scanQr} 
          onClose={() => setIsScannerOpen(false)} 
          onScan={handleScan} 
          translation={translation} 
        />
      )}

      {showManualInput && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
           <div className={`w-full max-w-sm rounded-[48px] p-10 border shadow-2xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-8">
                <Keyboard size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-center">{translation.manualEntry}</h3>
              <p className="text-xs opacity-50 mb-8 text-center px-4">{translation.manualEntrySub}</p>
              
              <input 
                autoFocus
                type="text" 
                value={manualId} 
                onChange={e => setManualId(e.target.value)} 
                placeholder="ID..."
                onKeyDown={e => e.key === 'Enter' && handleManualConfirm()}
                className={`w-full border rounded-[24px] px-6 py-5 text-lg font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`} 
              />
              
              <div className="flex gap-3">
                 <button onClick={() => setShowManualInput(false)} className={`flex-1 py-4 font-bold rounded-2xl ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/40'}`}>{translation.close}</button>
                 <button onClick={handleManualConfirm} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all">{translation.confirmAction}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
