import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, BookOpen, Plus, Search, Edit3, Trash2, X, Image as ImageIcon, Camera, Users, UserPlus, User as UserIcon, Settings, QrCode, CheckCircle2, AlertCircle, Trophy, Star, Clock, DollarSign, Calendar } from 'lucide-react';
import { Translation, SystemSettings, SundaySchoolClass, SundaySchoolStudent, Member, SundaySchoolStudentStatus, SundaySchoolReport, SundaySchoolAttendance, User } from '../types';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { formatToMMDDYYYY, getLocalYYYYMMDD } from '../lib/utils';

interface SundaySchoolScreenProps {
  translation: Translation;
  settings: SystemSettings;
  classes: SundaySchoolClass[];
  students: SundaySchoolStudent[];
  members: Member[];
  currentUser: User;
  reports?: SundaySchoolReport[];
  attendance?: SundaySchoolAttendance[];
  onBack: () => void;
  onAddClass: (c: SundaySchoolClass) => void;
  onUpdateClass: (c: SundaySchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onAddStudent: (s: SundaySchoolStudent) => void;
  onUpdateStudent: (s: SundaySchoolStudent) => void;
  onDeleteStudent: (id: string) => void;
  onAddReport?: (r: SundaySchoolReport) => void;
  onUpdateReport?: (r: SundaySchoolReport) => void;
  onDeleteReport?: (id: string) => void;
  onAddAttendance?: (a: SundaySchoolAttendance) => void;
  onUpdateSettings?: (s: SystemSettings) => void;
}

export const SundaySchoolScreen: React.FC<SundaySchoolScreenProps> = ({ 
  translation, 
  settings, 
  classes,
  students,
  members,
  currentUser,
  onBack,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  reports = [],
  attendance = [],
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  onAddAttendance,
  onUpdateSettings
}) => {
  const isLight = settings.theme === 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'classes' | 'reports' | 'rankings'>('classes');
  
  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [cutoffTime, setCutoffTime] = useState(settings.sundaySchoolCutoffTime || '09:30');

  // Scanner Modal State
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SundaySchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [classStatus, setClassStatus] = useState<'active' | 'inactive'>('active');
  const [classImage, setClassImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View Class State
  const [selectedClass, setSelectedClass] = useState<SundaySchoolClass | null>(null);
  
  // Student Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  
  // Guest Form State
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestStatus, setGuestStatus] = useState<SundaySchoolStudentStatus>('Regular Visitor');

  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDate, setReportDate] = useState(getLocalYYYYMMDD());
  const [editingReportDate, setEditingReportDate] = useState<string | null>(null);
  const [editingSingleReport, setEditingSingleReport] = useState<SundaySchoolReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<SundaySchoolReport | null>(null);
  const [reportFilterDate, setReportFilterDate] = useState('');
  const [rankingFilterDate, setRankingFilterDate] = useState('');
  const [reportData, setReportData] = useState<Record<string, { bibles: number | string, songbooks: number | string, guests: number | string, offering: number | string }>>({});

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Class Management
  const handleOpenClassModal = (c?: SundaySchoolClass) => {
    if (c) {
      setEditingClass(c);
      setClassName(c.name);
      setClassStatus(c.status);
      setClassImage(c.image);
    } else {
      setEditingClass(null);
      setClassName('');
      setClassStatus('active');
      setClassImage(null);
    }
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setEditingClass(null);
    setClassName('');
    setClassStatus('active');
    setClassImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClassImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClass = () => {
    if (!className.trim()) return;

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        name: className.trim(),
        status: classStatus,
        image: classImage,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddClass({
        id: `SSC-${Date.now()}`,
        name: className.trim(),
        status: classStatus,
        image: classImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      });
    }
    handleCloseClassModal();
  };

  // Student Management
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.classId === selectedClass.id && !s.deletedAt);
  }, [selectedClass, students]);

  const enrolledMemberIds = useMemo(() => {
    return new Set(students.filter(s => !s.deletedAt && !s.isGuest && s.memberId).map(s => s.memberId));
  }, [students]);

  const availableMembers = useMemo(() => {
    return members.filter(m => 
      !enrolledMemberIds.has(m.id) && 
      (m.firstName.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
       m.lastName.toLowerCase().includes(studentSearchTerm.toLowerCase()))
    );
  }, [members, enrolledMemberIds, studentSearchTerm]);

  const handleOpenStudentModal = () => {
    setIsStudentModalOpen(true);
    setIsGuestMode(false);
    setStudentSearchTerm('');
    setSelectedMemberIds(new Set());
    setGuestFirstName('');
    setGuestLastName('');
    setGuestStatus('Regular Visitor');
  };

  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
    setSelectedMemberIds(new Set());
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMemberIds);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMemberIds(newSelection);
  };

  const handleAddSelectedMembers = () => {
    if (!selectedClass || selectedMemberIds.size === 0) return;
    
    selectedMemberIds.forEach((memberId, index) => {
      onAddStudent({
        id: `SSS-${Date.now()}-${index}`,
        classId: selectedClass.id,
        memberId,
        isGuest: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      });
    });
    
    handleCloseStudentModal();
  };

  const handleAddGuestStudent = () => {
    if (!selectedClass || !guestFirstName.trim() || !guestLastName.trim()) return;
    onAddStudent({
      id: `SSS-${Date.now()}`,
      classId: selectedClass.id,
      isGuest: true,
      firstName: guestFirstName.trim(),
      lastName: guestLastName.trim(),
      status: guestStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    });
    handleCloseStudentModal();
  };

  const handleOpenReportModal = () => {
    setEditingReportDate(null);
    setEditingSingleReport(null);
    setReportDate(getLocalYYYYMMDD());
    const initialData: Record<string, { bibles: number | string, songbooks: number | string, guests: number | string, offering: number | string }> = {};
    classes.filter(c => c.status === 'active').forEach(c => {
      initialData[c.id] = { bibles: '', songbooks: '', guests: '', offering: '' };
    });
    setReportData(initialData);
    setIsReportModalOpen(true);
  };

  const handleEditSingleReport = (report: SundaySchoolReport) => {
    setEditingReportDate(report.date);
    setEditingSingleReport(report);
    setReportDate(report.date);
    setReportData({
      [report.classId]: {
        bibles: report.bibles === 0 ? '' : report.bibles,
        songbooks: report.songbooks === 0 ? '' : report.songbooks,
        guests: report.guests === 0 ? '' : report.guests,
        offering: report.offering === 0 ? '' : report.offering
      }
    });
    setIsReportModalOpen(true);
  };

  const handleSaveReport = () => {
    if (!onAddReport) return;
    
    Object.entries(reportData).forEach(([classId, data]: [string, any], index) => {
      const existingReport = reports.find(r => r.date === reportDate && r.classId === classId && !r.deletedAt);
      
      const bibles = data.bibles === '' ? 0 : Number(data.bibles) || 0;
      const songbooks = data.songbooks === '' ? 0 : Number(data.songbooks) || 0;
      const guests = data.guests === '' ? 0 : Number(data.guests) || 0;
      const offering = data.offering === '' ? 0 : Number(data.offering) || 0;

      if (existingReport && onUpdateReport) {
        onUpdateReport({
          ...existingReport,
          bibles,
          songbooks,
          guests,
          offering,
          updatedAt: new Date().toISOString()
        });
      } else {
        onAddReport({
          id: `SSR-${Date.now()}-${index}`,
          date: reportDate,
          classId,
          bibles,
          songbooks,
          guests,
          offering,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null
        });
      }
    });
    
    setIsReportModalOpen(false);
  };

  const handleSaveSettings = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        sundaySchoolCutoffTime: cutoffTime
      });
    }
    setIsSettingsModalOpen(false);
  };

  const processAttendance = (code: string) => {
    if (!onAddAttendance) return;
    
    const member = members.find(m => m.id === code || m.pin === code);
    if (!member) {
      setScanResult({ success: false, message: 'Member not found.' });
      return;
    }

    const student = students.find(s => s.memberId === member.id && !s.deletedAt);
    if (!student) {
      setScanResult({ success: false, message: `${member.firstName} is not enrolled in any class.` });
      return;
    }

    const today = getLocalYYYYMMDD();
    const existingAttendance = attendance.find(a => a.studentId === student.id && a.date === today && !a.deletedAt);
    
    if (existingAttendance) {
      setScanResult({ success: false, message: `${member.firstName} is already registered today.` });
      return;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const targetCutoff = settings.sundaySchoolCutoffTime || '09:30';
    
    const status = currentTime <= targetCutoff ? 'on_time' : 'late';

    onAddAttendance({
      id: `SSA-${Date.now()}`,
      date: today,
      studentId: student.id,
      classId: student.classId,
      arrivalTime: currentTime,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    });

    setScanResult({ success: true, message: `${member.firstName} registered as ${status === 'on_time' ? 'On Time' : 'Late'} (${currentTime}).` });
    setScanInput('');
  };

  const processAttendanceRef = useRef(processAttendance);
  useEffect(() => {
    processAttendanceRef.current = processAttendance;
  }, [processAttendance]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let isMounted = true;

    if (isScannerModalOpen) {
      // Small delay to ensure the DOM element is ready
      const timer = setTimeout(() => {
        if (!isMounted) return;
        try {
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          scanner.render(
            (decodedText) => {
              processAttendanceRef.current(decodedText);
            },
            (error) => {
              // Ignore scan errors
            }
          );
        } catch (err) {
          console.error("Scanner initialization error:", err);
        }
      }, 100);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (scanner) {
          try {
            scanner.clear().catch(console.error);
          } catch (err) {
            console.error("Scanner cleanup error:", err);
          }
        }
      };
    } else {
      setScanResult(null);
      setScanInput('');
    }
  }, [isScannerModalOpen]);

  const getStudentName = (s: SundaySchoolStudent) => {
    if (s.isGuest) return `${s.firstName} ${s.lastName}`;
    const member = members.find(m => m.id === s.memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown Member';
  };

  const getStudentStatus = (s: SundaySchoolStudent) => {
    if (s.isGuest) return s.status;
    const member = members.find(m => m.id === s.memberId);
    return member?.memberType || 'Member';
  };

  const getStudentPhoto = (s: SundaySchoolStudent) => {
    if (s.isGuest) return null;
    const member = members.find(m => m.id === s.memberId);
    return member?.photo || null;
  };

  const todaysAttendance = useMemo(() => {
    const todayStr = getLocalYYYYMMDD();
    return attendance
      .filter(a => a.date === todayStr && !a.deletedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [attendance]);

  // View: Class Details
  if (selectedClass) {
    return (
      <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'} font-sans pb-24`}>
        <div className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/10'} px-4 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedClass(null)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              {selectedClass.name}
            </h1>
          </div>
          <button 
            onClick={handleOpenStudentModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
              isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add Person</span>
          </button>
        </div>

        <div className="p-4 max-w-5xl mx-auto mt-4 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className={isLight ? 'text-blue-600' : 'text-blue-400'} />
              Class Roster ({classStudents.length})
            </h2>
          </div>

          {classStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.map(student => (
                <div key={student.id} className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e2028] border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    {getStudentPhoto(student) ? (
                      <img src={getStudentPhoto(student)!} alt={getStudentName(student)} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.isGuest ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        <UserIcon size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{getStudentName(student)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${student.isGuest ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {student.isGuest ? 'Guest' : 'Member'}
                        </span>
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {getStudentStatus(student)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { if(window.confirm('Remove person from class?')) onDeleteStudent(student.id); }} className={`p-2 rounded-full text-red-500 transition-colors ${isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/10'}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-12 text-center rounded-3xl border border-dashed ${isLight ? 'border-slate-300 text-slate-500 bg-white/50' : 'border-white/20 text-white/50 bg-white/5'}`}>
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No people in this class</h3>
              <p className="text-sm">Click "Add Person" to start building your roster.</p>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
              <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                <h2 className="text-lg font-semibold">Add Person to Class</h2>
                <button onClick={handleCloseStudentModal} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 flex gap-2">
                <button 
                  onClick={() => setIsGuestMode(false)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${!isGuestMode ? (isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400') : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/60')}`}
                >
                  System Member
                </button>
                <button 
                  onClick={() => setIsGuestMode(true)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${isGuestMode ? (isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400') : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/60')}`}
                >
                  Guest
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {!isGuestMode ? (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}>
                      <Search size={18} className={isLight ? 'text-slate-400' : 'text-white/40'} />
                      <input 
                        type="text"
                        placeholder="Search members..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none flex-1 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {availableMembers.length > 0 ? (
                        <>
                          {availableMembers.map(m => {
                            const isSelected = selectedMemberIds.has(m.id);
                            return (
                              <div 
                                key={m.id} 
                                onClick={() => toggleMemberSelection(m.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                                  isSelected 
                                    ? (isLight ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-blue-500/10')
                                    : (isLight ? 'border-slate-100 bg-white hover:bg-slate-50' : 'border-white/5 bg-white/5 hover:bg-white/10')
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {m.photo ? (
                                    <img src={m.photo} alt={`${m.firstName} ${m.lastName}`} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/50'}`}>
                                      <UserIcon size={20} />
                                    </div>
                                  )}
                                  <div>
                                    <p className={`font-medium text-sm ${isSelected ? (isLight ? 'text-blue-700' : 'text-blue-400') : ''}`}>
                                      {m.firstName} {m.lastName}
                                    </p>
                                    <p className={`text-xs ${isSelected ? (isLight ? 'text-blue-500' : 'text-blue-300') : (isLight ? 'text-slate-500' : 'text-slate-400')}`}>
                                      {m.memberType || 'Member'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-blue-500 border-blue-500 text-white' 
                                    : (isLight ? 'border-slate-300' : 'border-white/20')
                                }`}>
                                  {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                              </div>
                            );
                          })}
                          <button 
                            onClick={handleAddSelectedMembers}
                            disabled={selectedMemberIds.size === 0}
                            className={`w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50 mt-4 ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                          >
                            Add Selected ({selectedMemberIds.size})
                          </button>
                        </>
                      ) : (
                        <p className={`text-center py-4 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          No available members found. Members already in a class are hidden.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>First Name</label>
                      <input 
                        type="text" 
                        value={guestFirstName}
                        onChange={e => setGuestFirstName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Last Name</label>
                      <input 
                        type="text" 
                        value={guestLastName}
                        onChange={e => setGuestLastName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Status</label>
                      <select 
                        value={guestStatus}
                        onChange={e => setGuestStatus(e.target.value as SundaySchoolStudentStatus)}
                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                      >
                        <option value="Regular Visitor">Regular Visitor</option>
                        <option value="Normal">Normal</option>
                        <option value="Upcoming Member">Upcoming Member</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleAddGuestStudent}
                      disabled={!guestFirstName.trim() || !guestLastName.trim()}
                      className={`w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50 mt-4 ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      Add Guest
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'rankings') {
    const classStats: Record<string, { bibles: number, songbooks: number, guests: number, offering: number, attendance: number }> = {};
    
    classes.forEach(c => {
      classStats[c.id] = { bibles: 0, songbooks: 0, guests: 0, offering: 0, attendance: 0 };
    });

    const filteredReports = rankingFilterDate ? reports.filter(r => r.date === rankingFilterDate) : reports;
    const filteredAttendance = rankingFilterDate ? attendance.filter(a => a.date === rankingFilterDate) : attendance;

    filteredReports.forEach(r => {
      if (!r.deletedAt && classStats[r.classId]) {
        classStats[r.classId].bibles += r.bibles;
        classStats[r.classId].songbooks += r.songbooks;
        classStats[r.classId].guests += r.guests;
        classStats[r.classId].offering += r.offering;
      }
    });

    filteredAttendance.forEach(a => {
      if (!a.deletedAt && classStats[a.classId]) {
        classStats[a.classId].attendance += 1;
      }
    });

    const getTopClasses = (metric: keyof typeof classStats['any']) => {
      return [...classes]
        .map(c => ({ id: c.id, name: c.name, value: classStats[c.id][metric] }))
        .sort((a, b) => b.value - a.value);
    };

    const rankings = {
      bibles: getTopClasses('bibles'),
      songbooks: getTopClasses('songbooks'),
      guests: getTopClasses('guests'),
      offering: getTopClasses('offering'),
      attendance: getTopClasses('attendance'),
    };

    const firstPlaces: Record<string, number> = {};
    classes.forEach(c => firstPlaces[c.id] = 0);

    Object.values(rankings).forEach(rankingList => {
      if (rankingList.length > 0 && rankingList[0].value > 0) {
        const topValue = rankingList[0].value;
        rankingList.forEach(item => {
          if (item.value === topValue) {
            firstPlaces[item.id] += 1;
          }
        });
      }
    });

    const generalTop = [...classes]
      .map(c => ({ id: c.id, name: c.name, value: firstPlaces[c.id] }))
      .sort((a, b) => b.value - a.value);

    const renderRankingCard = (title: string, data: { id: string, name: string, value: number }[], icon: React.ReactNode, isCurrency = false) => (
      <div className={`rounded-3xl p-6 shadow-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e2028] border-white/5'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white'}`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        <div className="space-y-4">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20' :
                  index === 1 ? 'bg-slate-300 text-slate-700' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/50'
                }`}>
                  {index + 1}
                </div>
                <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{item.name}</span>
              </div>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isCurrency ? `$${item.value.toFixed(2)}` : item.value}
              </span>
            </div>
          ))}
          {data.length === 0 && (
            <div className={`text-center py-4 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              No data available
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'} font-sans pb-24`}>
        <div className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/10'} px-4 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('reports')} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              School Rankings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}>
              <Calendar size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
              <input 
                type="date" 
                value={rankingFilterDate}
                onChange={e => setRankingFilterDate(e.target.value)}
                className={`bg-transparent text-sm focus:outline-none ${isLight ? 'text-slate-700' : 'text-white'} [color-scheme:light] dark:[color-scheme:dark]`}
              />
              {rankingFilterDate && (
                <button 
                  onClick={() => setRankingFilterDate('')}
                  className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 max-w-6xl mx-auto mt-4 space-y-8">
          {/* General Top */}
          <div className={`rounded-[2rem] p-8 shadow-2xl relative overflow-hidden ${isLight ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gradient-to-br from-yellow-600 to-orange-700 text-white'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Star size={32} className="text-yellow-200" />
                <h2 className="text-3xl font-bold tracking-tight">General Top Classes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generalTop.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg ${
                      index === 0 ? 'bg-yellow-300 text-yellow-900' :
                      index === 1 ? 'bg-slate-200 text-slate-800' :
                      'bg-amber-600 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-white/80 font-medium">{item.value} First Places</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Specific Rankings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderRankingCard('Bibles', rankings.bibles, <BookOpen size={24} />)}
            {renderRankingCard('Songbooks', rankings.songbooks, <BookOpen size={24} />)}
            {renderRankingCard('Guests', rankings.guests, <Users size={24} />)}
            {renderRankingCard('Attendance', rankings.attendance, <Clock size={24} />)}
            {renderRankingCard('Offerings', rankings.offering, <DollarSign size={24} />, true)}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'reports') {
    const filteredReports = reports.filter(r => !r.deletedAt && (!reportFilterDate || r.date === reportFilterDate))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'} font-sans pb-24`}>
        <div className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/10'} px-4 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('classes')} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <BookOpen size={20} className={isLight ? 'text-blue-600' : 'text-blue-400'} />
              School Reports
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('rankings')} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`} title="Rankings">
              <Trophy size={20} className="text-yellow-500" />
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
              <Settings size={20} />
            </button>
            <button 
              onClick={() => setIsScannerModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">Attendance</span>
            </button>
            <button 
              onClick={handleOpenReportModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Report</span>
            </button>
          </div>
        </div>

        <div className="p-4 max-w-5xl mx-auto mt-4 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}>
              <Search size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
              <input 
                type="date"
                value={reportFilterDate}
                onChange={e => setReportFilterDate(e.target.value)}
                className={`bg-transparent text-sm focus:outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
              />
              {reportFilterDate && (
                <button onClick={() => setReportFilterDate('')} className="p-1 hover:bg-slate-200 rounded-full">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e2028] border-white/5'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className={`text-xs uppercase ${isLight ? 'text-slate-500 bg-slate-50' : 'text-slate-400 bg-white/5'}`}>
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3 text-center">Bibles</th>
                      <th className="px-4 py-3 text-center">Songbooks</th>
                      <th className="px-4 py-3 text-center">Guests</th>
                      <th className="px-4 py-3 text-center">On Time</th>
                      <th className="px-4 py-3 text-center">Late</th>
                      <th className="px-4 py-3 text-right">Offering</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => {
                      const cls = classes.find(c => c.id === report.classId);
                      const classAttendance = attendance.filter(a => a.date === report.date && a.classId === report.classId && !a.deletedAt);
                      const onTimeCount = classAttendance.filter(a => a.status === 'on_time').length;
                      const lateCount = classAttendance.filter(a => a.status === 'late').length;
                      
                      return (
                        <tr key={report.id} className={`border-b last:border-0 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                          <td className="px-4 py-3 font-medium">{formatToMMDDYYYY(report.date)}</td>
                          <td className="px-4 py-3 font-medium">{cls?.name || 'Unknown Class'}</td>
                          <td className="px-4 py-3 text-center">{report.bibles}</td>
                          <td className="px-4 py-3 text-center">{report.songbooks}</td>
                          <td className="px-4 py-3 text-center">{report.guests}</td>
                          <td className="px-4 py-3 text-center text-green-500">{onTimeCount}</td>
                          <td className="px-4 py-3 text-center text-red-500">{lateCount}</td>
                          <td className="px-4 py-3 text-right">${report.offering.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            {(currentUser.role === 'admin' || currentUser.role === 'secretaria' || currentUser.role === 'contable' || currentUser.id === '1') && (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditSingleReport(report)} className={`p-1.5 rounded-lg transition-colors inline-block ${isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10'}`} title="Edit Report">
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => setReportToDelete(report)} className={`p-1.5 rounded-lg transition-colors inline-block ${isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`} title="Delete Report">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-3xl border border-dashed ${isLight ? 'border-slate-300 text-slate-500 bg-white/50' : 'border-white/20 text-white/50 bg-white/5'}`}>
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-sm">Try changing the date filter or create a new report.</p>
            </div>
          )}
        </div>

        {/* Report Modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
              <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                <h2 className="text-lg font-semibold">{editingReportDate ? 'Edit Sunday School Report' : 'New Sunday School Report'}</h2>
                <button onClick={() => setIsReportModalOpen(false)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 space-y-6">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Report Date</label>
                  <input 
                    type="date" 
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                    disabled={!!editingReportDate}
                    className={`w-full max-w-xs px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'} ${editingReportDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Class Reports</h3>
                  {classes.filter(c => c.status === 'active' || reportData[c.id]).map(c => {
                    if (editingSingleReport && c.id !== editingSingleReport.classId) return null;
                    
                    const classAttendance = attendance.filter(a => a.date === reportDate && a.classId === c.id && !a.deletedAt);
                    const onTimeCount = classAttendance.filter(a => a.status === 'on_time').length;
                    const lateCount = classAttendance.filter(a => a.status === 'late').length;

                    return (
                    <div key={c.id} className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{c.name}</h4>
                        <div className="text-xs flex gap-3">
                          <span className="text-green-500">On Time: {onTimeCount}</span>
                          <span className="text-red-500">Late: {lateCount}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-xs mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bibles</label>
                          <input 
                            type="number" 
                            min="0"
                            value={reportData[c.id]?.bibles === undefined ? '' : reportData[c.id]?.bibles}
                            onChange={e => setReportData(prev => ({ ...prev, [c.id]: { ...prev[c.id], bibles: e.target.value } }))}
                            className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Songbooks</label>
                          <input 
                            type="number" 
                            min="0"
                            value={reportData[c.id]?.songbooks === undefined ? '' : reportData[c.id]?.songbooks}
                            onChange={e => setReportData(prev => ({ ...prev, [c.id]: { ...prev[c.id], songbooks: e.target.value } }))}
                            className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Guests</label>
                          <input 
                            type="number" 
                            min="0"
                            value={reportData[c.id]?.guests === undefined ? '' : reportData[c.id]?.guests}
                            onChange={e => setReportData(prev => ({ ...prev, [c.id]: { ...prev[c.id], guests: e.target.value } }))}
                            className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Offering ($)</label>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={reportData[c.id]?.offering === undefined ? '' : reportData[c.id]?.offering}
                            onChange={e => setReportData(prev => ({ ...prev, [c.id]: { ...prev[c.id], offering: e.target.value } }))}
                            className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}
                          />
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
              
              <div className={`p-4 border-t flex justify-end gap-3 ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-black/20'}`}>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-white/70 hover:bg-white/10'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveReport}
                  className={`px-6 py-2 rounded-xl text-sm font-medium text-white transition-transform active:scale-95 ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  Save Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Delete Modal */}
        {reportToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
              <h3 className="text-lg font-semibold mb-2">Delete Report</h3>
              <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setReportToDelete(null)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (onDeleteReport) {
                      onDeleteReport(reportToDelete.id);
                    } else if (onUpdateReport) {
                      onUpdateReport({
                        ...reportToDelete,
                        deletedAt: new Date().toISOString()
                      });
                    }
                    setReportToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
              <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                <h2 className="text-lg font-semibold">Report Settings</h2>
                <button onClick={() => setIsSettingsModalOpen(false)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Cutoff Time (On Time vs Late)
                  </label>
                  <input 
                    type="time" 
                    value={cutoffTime}
                    onChange={e => setCutoffTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                  />
                  <p className={`mt-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Students arriving before this time will be marked as "On Time".
                  </p>
                </div>
              </div>
              
              <div className={`p-4 border-t flex justify-end gap-3 ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-black/20'}`}>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-white/70 hover:bg-white/10'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className={`px-6 py-2 rounded-xl text-sm font-medium text-white transition-transform active:scale-95 ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Modal */}
        {isScannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
              <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                <h2 className="text-lg font-semibold">Register Attendance</h2>
                <button onClick={() => setIsScannerModalOpen(false)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {scanResult && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 ${scanResult.success ? (isLight ? 'bg-green-50 text-green-800' : 'bg-green-500/10 text-green-400') : (isLight ? 'bg-red-50 text-red-800' : 'bg-red-500/10 text-red-400')}`}>
                    {scanResult.success ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium">{scanResult.message}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Scan QR Code
                    </label>
                    <div className={`rounded-xl overflow-hidden border ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                      <div id="qr-reader" className="w-full"></div>
                    </div>
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}></div>
                    <span className={`flex-shrink-0 mx-4 text-xs font-medium uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Or enter manually</span>
                    <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}></div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Member ID or PIN
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && scanInput.trim()) {
                            processAttendance(scanInput.trim());
                          }
                        }}
                        placeholder="Enter ID and press Enter"
                        className={`flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                      />
                      <button 
                        onClick={() => scanInput.trim() && processAttendance(scanInput.trim())}
                        disabled={!scanInput.trim()}
                        className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>

                {todaysAttendance.length > 0 && (
                  <div className={`pt-6 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    <h3 className={`font-semibold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      Today's Attendance ({todaysAttendance.length})
                    </h3>
                    <div className="space-y-3">
                      {todaysAttendance.map(record => {
                        const student = students.find(s => s.id === record.studentId);
                        if (!student) return null;
                        const photo = getStudentPhoto(student);
                        const name = getStudentName(student);
                        const isLate = record.status === 'late';
                        
                        return (
                          <div key={record.id} className={`flex items-center justify-between p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
                            <div className="flex items-center gap-3">
                              {photo ? (
                                <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-white/50'}`}>
                                  <UserIcon size={20} />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{name}</p>
                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {classes.find(c => c.id === record.classId)?.name || 'Unknown Class'}
                                </p>
                              </div>
                            </div>
                            <div className={`text-sm font-bold ${isLate ? 'text-red-500' : 'text-green-500'}`}>
                              {record.arrivalTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'} font-sans pb-24`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/10'} px-4 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen size={20} className={isLight ? 'text-blue-600' : 'text-blue-400'} />
            {translation.moduleNames?.sundaySchool || 'Sunday School'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
              isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Report School</span>
          </button>
          <button 
            onClick={() => handleOpenClassModal()}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
              isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Class</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-5xl mx-auto mt-4 space-y-6">
        {/* Search Bar */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e2028] border-white/5'}`}>
          <Search size={20} className={isLight ? 'text-slate-400' : 'text-white/40'} />
          <input 
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-sm"
          />
        </div>

        {/* Classes Grid */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClasses.map(c => {
              const studentCount = students.filter(s => s.classId === c.id && !s.deletedAt).length;
              return (
                <div key={c.id} onClick={() => setSelectedClass(c)} className={`group rounded-2xl border p-3 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-200 hover:border-blue-200' : 'bg-[#1e2028] border-white/5 hover:border-white/20'}`}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={24} className="opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-base truncate pr-2">{c.name}</h3>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${c.status === 'active' ? (isLight ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400') : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white/50')}`}>
                        {c.status === 'active' ? translation.active || 'Active' : translation.inactive || 'Inactive'}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Users size={12} />
                      {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenClassModal(c); }} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-blue-50 hover:text-blue-600' : 'hover:bg-blue-500/10 hover:text-blue-400'}`}>
                      <Edit3 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Are you sure?')) onDeleteClass(c.id); }} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-red-500/10 hover:text-red-400'}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-12 text-center rounded-3xl border border-dashed ${isLight ? 'border-slate-300 text-slate-500 bg-white/50' : 'border-white/20 text-white/50 bg-white/5'}`}>
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No classes found</h3>
            <p className="text-sm">Create your first Sunday School class to get started.</p>
          </div>
        )}
      </div>

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
              <h2 className="text-lg font-semibold">{editingClass ? 'Edit Class' : 'New Class'}</h2>
              <button onClick={handleCloseClassModal} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  className={`w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer relative group ${isLight ? 'border-slate-300 bg-slate-50' : 'border-white/20 bg-white/5'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {classImage ? (
                    <>
                      <img src={classImage} alt="Class" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <span className="text-xs font-medium">Add Image</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                {classImage && (
                  <button onClick={() => setClassImage(null)} className="text-xs text-red-500 font-medium hover:underline">
                    Remove Image
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Class Name</label>
                <input 
                  type="text" 
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                  placeholder="e.g. Adults, Youth, Kids..."
                />
              </div>

              {/* Status */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Status</label>
                <select 
                  value={classStatus}
                  onChange={e => setClassStatus(e.target.value as 'active' | 'inactive')}
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
                >
                  <option value="active">{translation.active || 'Active'}</option>
                  <option value="inactive">{translation.inactive || 'Inactive'}</option>
                </select>
              </div>
            </div>

            <div className={`p-4 border-t flex gap-3 ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-black/20'}`}>
              <button 
                onClick={handleCloseClassModal}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-white border border-slate-200 hover:bg-slate-50' : 'bg-[#2a2d35] hover:bg-[#32363f]'}`}
              >
                {translation.cancel || 'Cancel'}
              </button>
              <button 
                onClick={handleSaveClass}
                disabled={!className.trim()}
                className={`flex-1 py-3 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50 ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {translation.save || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
