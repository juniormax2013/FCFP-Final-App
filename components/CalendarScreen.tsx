
import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users, X, Trash2, Edit3, Filter, Briefcase, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { Translation, Activity, SystemSettings, Member, User, Language, ModulePermission } from '../types';
// Removed non-existent DEPARTMENT_COLORS and ACTIVITY_CATEGORIES from constants import
import { ActivityFormModal } from './ActivitiesScreen';

interface CalendarScreenProps {
  translation: Translation; settings: SystemSettings; activities: Activity[]; members: Member[]; currentUser: User; lang: Language; onBack: () => void; onAddActivity: (a: Activity) => void; onUpdateActivity: (a: Activity) => void; onDeleteActivity: (id: string) => void;
  isRestricted: boolean;
  permissions?: ModulePermission;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ translation, settings, activities, members, currentUser, lang, onBack, onAddActivity, onUpdateActivity, onDeleteActivity, isRestricted, permissions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const isLight = settings.theme === 'light';

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const selectedDayActivities = useMemo(() => {
    return activities.filter(a => {
      const aDate = new Date(a.time);
      return aDate.getDate() === selectedDate.getDate() && aDate.getMonth() === selectedDate.getMonth() && aDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [activities, selectedDate]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`px-4 sm:px-8 py-4 flex items-center justify-between border-b ${isLight ? 'bg-white border-slate-200' : 'bg-black border-white/5'}`}>
        <div className="flex items-center gap-4"><button onClick={onBack} className={`p-2 rounded-full transition-all ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}><ArrowLeft size={24} /></button><h2 className="text-xl font-bold tracking-tight">{translation.moduleNames.calendar}</h2></div>
        <div className={`flex items-center p-1 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}><button onClick={prevMonth} className="p-1.5"><ChevronLeft size={20}/></button><span className="px-3 text-sm font-black uppercase min-w-[120px] text-center">{currentDate.toLocaleString('en', { month: 'long', year: 'numeric' })}</span><button onClick={nextMonth} className="p-1.5"><ChevronRight size={20}/></button></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32"><div className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8"><div className={`rounded-[40px] p-6 border shadow-2xl ${isLight ? 'bg-white' : 'glass'}`}><div className="grid grid-cols-7 mb-6">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black opacity-30 uppercase">{d}</div>)}</div><div className="grid grid-cols-7 gap-1 sm:gap-2">{calendarDays.map((day, idx) => { if (!day) return <div key={`empty-${idx}`} className="h-12 sm:h-20" />; const isSelected = selectedDate.toDateString() === day.toDateString(); const dayEvents = activities.filter(a => new Date(a.time).toDateString() === day.toDateString()); return <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className={`h-12 sm:h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-blue-600 text-white shadow-xl scale-105 z-10' : (isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5')}`}><span className={`text-xs sm:text-base font-bold`}>{day.getDate()}</span>{dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />}</div>; })}</div></div></div>
          <div className="lg:col-span-4 space-y-6"><div className="flex items-center justify-between px-2"><h3 className="text-xl font-black">{selectedDate.getDate()} {selectedDate.toLocaleString('en', { month: 'long' })}</h3>{!isRestricted && <button onClick={() => setShowAddModal(true)} className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl"><Plus size={20}/></button>}</div><div className="space-y-4">{selectedDayActivities.map((a) => (
            <div key={a.id} className={`p-6 border rounded-[32px] ${isLight ? 'bg-white border-slate-100' : 'glass border-white/5'}`}>
              <h4 className="text-lg font-bold leading-tight">{a.title}</h4>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase font-bold"><Clock size={10} className="text-blue-500" /> {new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase font-bold"><MapPin size={10} className="text-red-500" /> {a.address}</div>
              </div>
              {!isRestricted && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => setEditingActivity(a)} className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={14} /> Edit</button>
                  <button onClick={() => setActivityToDelete(a.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}{selectedDayActivities.length === 0 && <p className="text-center opacity-30 italic py-10">No hay eventos para hoy</p>}</div></div>
      </div></div>

      {activityToDelete && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-hidden animate-in fade-in duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
          <div className={`w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col shadow-2xl border p-8 text-center ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
            <h3 className="text-xl font-black mb-4">Are you sure you want to delete this activity?</h3>
            <p className={`text-sm mb-8 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setActivityToDelete(null)} className={`flex-1 py-4 font-bold rounded-2xl transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Cancel</button>
              <button onClick={() => { onDeleteActivity(activityToDelete); setActivityToDelete(null); }} className="flex-1 py-4 font-bold bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ActivityFormModal implementation */}
      {(showAddModal || editingActivity) && (
        <ActivityFormModal 
          initialData={editingActivity || { time: selectedDate.toISOString() } as Activity}
          onClose={() => { setShowAddModal(false); setEditingActivity(null); }}
          onSave={a => { if(editingActivity) onUpdateActivity(a); else onAddActivity(a); setShowAddModal(false); setEditingActivity(null); }}
          isLight={isLight}
          translation={translation}
          currentUser={currentUser}
          members={members}
        />
      )}
    </div>
  );
};
