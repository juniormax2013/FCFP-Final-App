
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ref, onValue, set } from "firebase/database";
import { db, requestNotificationPermission, sendFCMPushNotification } from './lib/firebase';
import { 
  Language, User, Activity, Member, Tithe, Offering, Donation, Donateur, DonateurPayment,
  Expense, Prayer, SystemSettings, SyncStatus, ModulePermission, AppNotification,
  GeoCountry, GeoProvince, GeoCity, Committee, CommitteeRole, AttendanceRecord, CommunionRecord, ThemeMode, SundaySchoolClass, SundaySchoolStudent, SundaySchoolReport, SundaySchoolAttendance, SystemModule, EditRequest
} from './types';
import { 
  TRANSLATIONS, INITIAL_USERS, MEMBER_TYPES, DEPARTMENT_LIST, INITIAL_COMMITTEE_ROLES, INITIAL_COMMITTEE_TYPES 
} from './constants';

// Components
import { MainMenu } from './components/MainMenu';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MembersScreen } from './components/MembersScreen';
import { ActivitiesScreen } from './components/ActivitiesScreen';
import { TitheScreen } from './components/TitheScreen';
import { OfferingScreen } from './components/OfferingScreen';
import { DonationScreen } from './components/DonationScreen';
import { DonateurScreen } from './components/DonateurScreen';
import { ExpenseScreen } from './components/ExpenseScreen';
import { PrayerScreen } from './components/PrayerScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { AttendanceCommunionScreen } from './components/AttendanceCommunionScreen';
import { BirthdayScreen } from './components/BirthdayScreen';
import { UsersManagement } from './components/UsersManagement';
import { SettingsScreen } from './components/SettingsScreen';
import { MemberTypesScreen } from './components/MemberTypesScreen';
import { GendersScreen } from './components/GendersScreen';
import { CivilStatusScreen } from './components/CivilStatusScreen';
import { NationalityScreen } from './components/NationalityScreen';
import { MemberLanguagesScreen } from './components/MemberLanguagesScreen';
import { SpiritualStatusScreen } from './components/SpiritualStatusScreen';
import { CountryManagementScreen } from './components/CountryManagementScreen';
import { ProvinceManagementScreen } from './components/ProvinceManagementScreen';
import { CityManagementScreen } from './components/CityManagementScreen';
import { DepartmentsScreen } from './components/DepartmentsScreen';
import { SpouseRelationshipTypesScreen } from './components/SpouseRelationshipTypesScreen';
import { CommitteeScreen } from './components/CommitteeScreen';
import { CommitteeRolesScreen } from './components/CommitteeRolesScreen';
import { CommitteeTypesScreen } from './components/CommitteeTypesScreen';
import { ExpenseCategoriesScreen } from './components/ExpenseCategoriesScreen';
import { IDTypesScreen } from './components/IDTypesScreen';
import { NotificationCenter } from './components/NotificationCenter';
import { IncompleteMembersScreen } from './components/IncompleteMembersScreen';
import { MemberSelfRegistration, RegistrationSuccess } from './components/MemberSelfRegistration';
import { RoleManagementScreen } from './components/RoleManagementScreen';
import { SendNotificationModal } from './components/SendNotificationModal';
import { SundaySchoolScreen } from './components/SundaySchoolScreen';
import { ModulesScreen } from './components/ModulesScreen';
import { EditRequestsScreen } from './components/EditRequestsScreen';
import { InstallPrompt } from './components/InstallPrompt';

// Sunday School Components
// Removed

// Lib
import { addToSyncQueue, findUserByPinOnline } from './lib/googleSheets';
import { getLocalYYYYMMDD } from './lib/utils';

const APP_MODULES = [
  'members', 'activities', 'tithes', 'offerings', 'donations', 'expenses', 
  'prayers', 'analytics', 'birthdays', 'calendar', 'committee', 'attendanceCommunion'
];

const INITIAL_ROLES = ['Regular', 'Líder de Ministerio', 'Pastor', 'Misionero', 'Visitante'];

const generateInitialPermissions = () => {
  const perms: Record<string, any> = {};
  APP_MODULES.forEach(mod => {
    perms[mod] = {};
    INITIAL_ROLES.forEach(role => {
      const isStaffType = ['Pastor', 'Líder de Ministerio'].includes(role);
      perms[mod][role] = { visible: true, canCreate: isStaffType, canEdit: isStaffType, canDelete: isStaffType };
    });
  });
  return perms;
};

const DEFAULT_SETTINGS: SystemSettings = {
  systemName: "Famille Chrétienne Foi Parfaite",
  systemLogo: null, 
  theme: 'dark',
  allowMemberRegistration: true,
  showRegistrationPin: true,
  planStatus: 'inactive',
  googleSheets: { status: 'connected', lastVerification: null, spreadsheetId: "wedding-5db69", principalEmail: "Firebase", authType: 'None', logs: [] },
  enabledModules: {
    members: true, activities: true, tithes: true, offerings: true, donations: true, expenses: true, prayers: true, analytics: true, birthdays: true, committee: true, calendar: true, attendanceCommunion: true, idTypes: true, countries: true, provinces: true, cities: true, civilStatus: true, nationalities: true, languages: true, spiritualStatus: true, memberTypes: true, departments: true, spouseRelationshipTypes: true, userManagement: true, roleManagement: true, expenseCategories: true, committeeRoles: true, committeeTypes: true
  },
  rolePermissions: generateInitialPermissions()
};

const App: React.FC = () => {
  // Configuración persistente por persona (Local Storage)
  const lang: Language = 'en';
  const [localTheme, setLocalTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('foi_theme') as ThemeMode) || 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('foi_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  });
  
  const [view, setView] = useState(() => {
    try {
      const savedUser = localStorage.getItem('foi_user');
      return savedUser ? 'menu' : 'login';
    } catch (e) {
      return 'login';
    }
  });
  const [pin, setPin] = useState('');
  const [isPinError, setIsPinError] = useState(false);
  const [registeredPin, setRegisteredPin] = useState('');
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'match', pendingCount: 0, lastSyncAt: new Date().toISOString() });
  const [showSendNotif, setShowSendNotif] = useState(false);

  // Validar vista (evitar pantalla negra por vistas eliminadas)
  useEffect(() => {
    const validViews = [
      'login', 'register', 'registrationSuccess', 'loading', 'menu', 'profile', 
      'members', 'activities', 'analytics', 'birthdays', 'calendar', 'tithes', 
      'offerings', 'donations', 'donateurs', 'expenses', 'prayers', 'attendance', 'users', 
      'settings', 'memberTypes', 'genders', 'civilStatus', 'nationalities', 
      'languages', 'spiritualStatus', 'countries', 'provinces', 'cities', 
      'departments', 'spouseRelationshipTypes', 'committee', 'committeeRoles', 
      'committeeTypes', 'expenseCategories', 'idTypes', 'notifications', 
      'incompleteMembers', 'roles', 'sunday_school', 'modules', 'edit_requests'
    ];
    if (!validViews.includes(view)) {
      setView(authenticatedUser ? 'menu' : 'login');
    } else if (view !== 'login' && view !== 'register' && view !== 'registrationSuccess' && view !== 'loading' && !authenticatedUser) {
      setView('login');
    }
  }, [view, authenticatedUser]);

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donateurs, setDonateurs] = useState<Donateur[]>([]);
  const [donateurPayments, setDonateurPayments] = useState<DonateurPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [provinces, setProvinces] = useState<GeoProvince[]>([]);
  const [cities, setCities] = useState<GeoCity[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [committeeRoles, setCommitteeRoles] = useState<CommitteeRole[]>(INITIAL_COMMITTEE_ROLES);
  const [committeeTypes, setCommitteeTypes] = useState<string[]>(INITIAL_COMMITTEE_TYPES);
  const [memberTypes, setMemberTypes] = useState<string[]>(MEMBER_TYPES);
  const [genders, setGenders] = useState<string[]>(['Male', 'Female', 'Other']);
  const [civilStatuses, setCivilStatuses] = useState<string[]>(['Single', 'Married', 'Divorced', 'Widowed']);
  const [nationalities, setNationalities] = useState<string[]>(['Haitian', 'Dominican', 'American']);
  const [memberLanguages, setMemberLanguages] = useState<string[]>(['English', 'Spanish', 'French', 'Creole']);
  const [spiritualStatuses, setSpiritualStatuses] = useState<string[]>(['Baptized', 'Not Baptized', 'Candidate']);
  const [departments, setDepartments] = useState<string[]>(DEPARTMENT_LIST);
  const [spouseRelationshipTypes, setSpouseRelationshipTypes] = useState<string[]>(['Spouse', 'Partner', 'Fiancé']);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['Rent', 'Utilities', 'Maintenance', 'Other']);
  const [idTypes, setIdTypes] = useState<string[]>(['ID Card', 'Passport']);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [communionRecords, setCommunionRecords] = useState<CommunionRecord[]>([]);
  const [attendanceRegistryActive, setAttendanceRegistryActive] = useState<Record<string, boolean>>({});
  const [sundaySchoolClasses, setSundaySchoolClasses] = useState<SundaySchoolClass[]>([]);
  const [systemModules, setSystemModules] = useState<SystemModule[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [sundaySchoolStudents, setSundaySchoolStudents] = useState<SundaySchoolStudent[]>([]);
  const [sundaySchoolReports, setSundaySchoolReports] = useState<SundaySchoolReport[]>([]);
  const [sundaySchoolAttendance, setSundaySchoolAttendance] = useState<SundaySchoolAttendance[]>([]);

  // Persistir cambios de idioma y tema
  useEffect(() => { 
    localStorage.setItem('foi_theme', localTheme); 
    const isLight = localTheme === 'light';
    const bgColor = isLight ? '#ffffff' : '#000000';
    
    document.body.style.backgroundColor = bgColor;
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', bgColor);
  }, [localTheme]);
  useEffect(() => {
    // We no longer save the view to localStorage so it always starts at home/login
  }, [view]);
  useEffect(() => {
    if (authenticatedUser) localStorage.setItem('foi_user', JSON.stringify(authenticatedUser));
    else localStorage.removeItem('foi_user');
  }, [authenticatedUser]);

  const t = TRANSLATIONS[lang];

  // Forzar que settings.theme siga al localTheme para compatibilidad con sub-componentes
  const derivedSettings = useMemo(() => ({
    ...settings,
    theme: localTheme
  }), [settings, localTheme]);

  const currentUserPermissions = useMemo(() => {
    if (!authenticatedUser) return null;
    if (authenticatedUser.id === '1' || authenticatedUser.role === 'admin') {
      const allEnabled: Record<string, ModulePermission> = {};
      APP_MODULES.forEach(mod => {
        allEnabled[mod] = { visible: true, canCreate: true, canEdit: true, canDelete: true };
      });
      return allEnabled;
    }
    
    if (authenticatedUser.role === 'secretaria' || authenticatedUser.role === 'contable') {
      const perms: Record<string, ModulePermission> = {};
      APP_MODULES.forEach(mod => {
        // Secretaria can edit/delete members, but not financial records
        if (authenticatedUser.role === 'secretaria') {
          const isFinancial = ['tithes', 'offerings', 'donations', 'expenses'].includes(mod);
          perms[mod] = { visible: true, canCreate: true, canEdit: !isFinancial, canDelete: !isFinancial };
        } else {
          // Contable can create financial records, but not edit/delete them directly
          const isFinancial = ['tithes', 'offerings', 'donations', 'expenses'].includes(mod);
          perms[mod] = { visible: isFinancial, canCreate: isFinancial, canEdit: false, canDelete: false };
        }
      });
      return perms;
    }

    const type = authenticatedUser.memberType || 'Regular';
    const perms: Record<string, ModulePermission> = {};
    APP_MODULES.forEach(mod => {
      const config = derivedSettings.rolePermissions?.[mod]?.[type];
      perms[mod] = config || { visible: true, canCreate: false, canEdit: false, canDelete: false };
    });
    return perms;
  }, [authenticatedUser, derivedSettings.rolePermissions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      setSettings(prev => {
        const newSettings = { ...prev, planStatus: 'active' as const };
        set(ref(db, 'settings/global'), newSettings);
        return newSettings;
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const tables = [
      { name: 'members', setter: setMembers },
      { name: 'activities', setter: setActivities },
      { name: 'users', setter: setUsers },
      { name: 'tithes', setter: setTithes },
      { name: 'offerings', setter: setOfferings },
      { name: 'donations', setter: setDonations },
      { name: 'donateurs', setter: setDonateurs },
      { name: 'donateur_payments', setter: setDonateurPayments },
      { name: 'expenses', setter: setExpenses },
      { name: 'prayers', setter: setPrayers },
      { name: 'notifications', setter: setNotifications },
      { name: 'countries', setter: setCountries },
      { name: 'provinces', setter: setProvinces },
      { name: 'cities', setter: setCities },
      { name: 'committees', setter: setCommittees },
      { name: 'committee_roles', setter: setCommitteeRoles },
      { name: 'committee_types', setter: setCommitteeTypes },
      { name: 'member_types', setter: setMemberTypes },
      { name: 'genders', setter: setGenders },
      { name: 'civil_statuses', setter: setCivilStatuses },
      { name: 'nationalities', setter: setNationalities },
      { name: 'member_languages', setter: setMemberLanguages },
      { name: 'spiritual_statuses', setter: setSpiritualStatuses },
      { name: 'departments', setter: setDepartments },
      { name: 'spouse_relationship_types', setter: setSpouseRelationshipTypes },
      { name: 'expense_categories', setter: setExpenseCategories },
      { name: 'id_types', setter: setIdTypes },
      { name: 'attendance_records', setter: setAttendanceRecords },
      { name: 'communion_records', setter: setCommunionRecords },
      { name: 'sunday_school_classes', setter: setSundaySchoolClasses },
      { name: 'sunday_school_students', setter: setSundaySchoolStudents },
      { name: 'sunday_school_reports', setter: setSundaySchoolReports },
      { name: 'sunday_school_attendance', setter: setSundaySchoolAttendance },
      { name: 'system_modules', setter: setSystemModules },
      { name: 'edit_requests', setter: setEditRequests }
    ];

    const unsubs = tables.map(table => onValue(ref(db, table.name), (snapshot) => {
      const data = snapshot.val();
      if (data) (table.setter as any)(Object.values(data).filter((item: any) => item && !item.deletedAt));
      else (table.setter as any)([]);
    }));

    onValue(ref(db, 'settings/global'), (snapshot) => { 
      if (snapshot.exists()) {
        const remoteSettings = snapshot.val();
        setSettings({ ...DEFAULT_SETTINGS, ...remoteSettings });
      }
    });

    onValue(ref(db, 'settings/attendance_active'), (snapshot) => { if (snapshot.exists()) setAttendanceRegistryActive(snapshot.val()); });

    return () => unsubs.forEach(u => u());
  }, []);

  const handleLogin = useCallback(async (currentPin: string) => {
    if (currentPin.length === 4) {
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
      let foundUser = await findUserByPinOnline(currentPin);
      if (!foundUser) {
        foundUser = INITIAL_USERS.find(u => u.pin === currentPin && !u.deletedAt) || null;
      }
      if (!foundUser) {
        const member = members.find(m => m.pin === currentPin && !m.deletedAt);
        if (member) {
          foundUser = {
            id: member.id, firstName: member.firstName, lastName: member.lastName, gender: member.gender,
            pin: member.pin || '', role: 'user', memberType: member.memberType, email: member.email,
            phone: member.phone, address: member.address, photo: member.photo, updatedAt: member.updatedAt, deletedAt: null
          };
        }
      }

      if (foundUser) {
        setAuthenticatedUser(foundUser);
        requestNotificationPermission(foundUser.id);
        setView('loading');
        setPin(''); 
        setSyncStatus(prev => ({ ...prev, status: 'match', lastSyncAt: new Date().toISOString() }));
      } else {
        setIsPinError(true);
        setSyncStatus(prev => ({ ...prev, status: 'error' }));
        setTimeout(() => { setIsPinError(false); setPin(''); }, 1000);
      }
    }
  }, [members]);

  useEffect(() => {
    if (authenticatedUser) {
      const updatedUser = users.find(u => u.id === authenticatedUser.id);
      if (updatedUser) {
        if (JSON.stringify(updatedUser) !== JSON.stringify(authenticatedUser)) {
          setAuthenticatedUser(updatedUser);
        }
      } else {
        const updatedMember = members.find(m => m.id === authenticatedUser.id);
        if (updatedMember) {
          const mappedUser = {
            id: updatedMember.id, firstName: updatedMember.firstName, lastName: updatedMember.lastName, gender: updatedMember.gender,
            pin: updatedMember.pin || '', role: 'user' as const, memberType: updatedMember.memberType, email: updatedMember.email,
            phone: updatedMember.phone, address: updatedMember.address, photo: updatedMember.photo, updatedAt: updatedMember.updatedAt, deletedAt: null
          };
          if (JSON.stringify(mappedUser) !== JSON.stringify(authenticatedUser)) {
            setAuthenticatedUser(mappedUser);
          }
        }
      }
    }
  }, [users, members, authenticatedUser]);

  useEffect(() => {
    if (view === 'login' && pin.length === 4 && !isPinError) handleLogin(pin);
  }, [pin, handleLogin, isPinError, view]);

  // Manejo de Datos (Firebase)
  const handleDataChange = async (table: string, action: 'CREATE' | 'UPDATE' | 'DELETE', payload: any) => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
    try {
      if (table === 'notifications' && action === 'CREATE' && payload.sendPush) {
        let targetTokens: string[] = [];
        
        if (payload.targetType === 'individual' && payload.targetId) {
          const targetUser = users.find(u => u.id === payload.targetId);
          if (targetUser && targetUser.fcmToken) {
            targetTokens.push(targetUser.fcmToken);
          }
        } else if (payload.targetType === 'role' && payload.targetId) {
          const targetUsers = users.filter(u => u.role === payload.targetId && u.fcmToken);
          targetTokens = targetUsers.map(u => u.fcmToken!);
        } else if (payload.targetType === 'all') {
          const targetUsers = users.filter(u => u.fcmToken);
          targetTokens = targetUsers.map(u => u.fcmToken!);
        }
        
        // Send push notifications to all target tokens
        for (const token of targetTokens) {
          sendFCMPushNotification(token, payload.title, payload.message, { actionUrl: payload.actionUrl });
        }
      }

      await addToSyncQueue({ table, action, payload });
      setSyncStatus(prev => ({ ...prev, status: 'match', lastSyncAt: new Date().toISOString() }));
    } catch (e) {
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
    }
  };

  const handleUpdateMember = async (updated: Member) => {
    await handleDataChange('members', 'UPDATE', updated);
  };

  // --- LOGICA DE NOTIFICACIONES ---

  const handleSendNotification = async (notifData: any) => {
    const id = `NTF-${Date.now()}`;
    const newNotif: AppNotification = {
      ...notifData,
      id,
      timestamp: new Date().toISOString(),
      readBy: [],
      deletedBy: []
    };
    await handleDataChange('notifications', 'CREATE', newNotif);
  };

  const handleMarkNotificationRead = async (id: string) => {
    if (!authenticatedUser) return;
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.readBy?.includes(authenticatedUser.id)) {
      const updated = {
        ...notif,
        readBy: [...(notif.readBy || []), authenticatedUser.id]
      };
      await handleDataChange('notifications', 'UPDATE', updated);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!authenticatedUser) return;
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      const updated = {
        ...notif,
        deletedBy: [...(notif.deletedBy || []), authenticatedUser.id]
      };
      await handleDataChange('notifications', 'UPDATE', updated);
    }
  };

  const handleClearNotifications = async (type: 'all' | 'read') => {
    if (!authenticatedUser) return;
    
    const targetNotifs = notifications.filter(n => {
      // Solo notificaciones destinadas a este usuario
      const isTarget = n.targetType === 'all' || 
                       (n.targetType === 'role' && n.targetId === authenticatedUser.role) ||
                       (n.targetType === 'individual' && n.targetId === authenticatedUser.id);
      
      if (!isTarget) return false;
      if (n.deletedBy?.includes(authenticatedUser.id)) return false;
      
      if (type === 'read') return n.readBy?.includes(authenticatedUser.id);
      return true;
    });

    for (const n of targetNotifs) {
      const updated = {
        ...n,
        deletedBy: [...(n.deletedBy || []), authenticatedUser.id]
      };
      await handleDataChange('notifications', 'UPDATE', updated);
    }
  };

  const handleRegistrationComplete = async (data: Partial<Member>) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    const newMember: Member = { ...data, id: `M-${Date.now().toString().slice(-6)}`, pin: newPin, updatedAt: new Date().toISOString(), entryDate: getLocalYYYYMMDD(), isActive: true, churchRole: 'Member', memberType: 'Regular', department: 'N/A' } as Member;
    await handleDataChange('members', 'CREATE', newMember);
    setRegisteredPin(newPin);
    if (settings.showRegistrationPin) setView('registrationSuccess');
    else setView('login');
  };

  const isLight = localTheme === 'light';
  const handleRequestEdit = (screenId: string, recordId: string, whatToEdit: string, reason: string) => {
    const module = systemModules.find(m => m.screens?.includes(screenId));
    if (!module) {
      alert("No responsible module found for this screen.");
      return;
    }
    const req: EditRequest = {
      id: Date.now().toString(),
      moduleId: module.id,
      screenId,
      recordId,
      requesterId: authenticatedUser!.id,
      responsibleId: module.responsibleId,
      whatToEdit,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    handleDataChange('edit_requests', 'CREATE', req);
    
    const notif = {
      id: `NTF-${Date.now()}`,
      title: 'New Edit Request',
      message: `User ${authenticatedUser?.firstName} ${authenticatedUser?.lastName} has requested to edit a record in the ${module.name} module.\n\nWhat to edit: ${whatToEdit}\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      senderPhoto: authenticatedUser?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System')}&background=random`,
      senderName: authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System',
      senderId: authenticatedUser?.id,
      targetType: 'individual' as const,
      targetId: module.responsibleId,
      readBy: [],
      deletedBy: [],
      actionUrl: 'edit_requests',
      sendPush: true
    };
    handleDataChange('notifications', 'CREATE', notif);
    
    alert("Edit request sent to the module responsible.");
  };

  const handleCompleteEditRequest = (screenId: string, recordId: string) => {
    const req = editRequests.find(r => r.screenId === screenId && r.recordId === recordId && r.requesterId === authenticatedUser?.id && r.status === 'approved');
    if (req) {
      handleDataChange('edit_requests', 'UPDATE', { ...req, status: 'completed' });
      
      const notif = {
        id: Date.now().toString(),
        title: 'Edit Completed',
        message: `The user has completed the edit in module ${req.moduleId}.`,
        timestamp: new Date().toISOString(),
        senderPhoto: authenticatedUser?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System')}&background=random`,
        senderName: authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System',
        senderId: authenticatedUser?.id,
        targetType: 'individual' as const,
        targetId: req.responsibleId,
        readBy: [],
        deletedBy: [],
        sendPush: true
      };
      handleDataChange('notifications', 'CREATE', notif);
    }
  };

  const safePerms = (mod: string) => {
    const defaultPerms = currentUserPermissions?.[mod] || { visible: false, canCreate: false, canEdit: false, canDelete: false };
    const isResponsible = systemModules.some(m => m.responsibleId === authenticatedUser?.id && m.screens?.includes(mod));
    if (isResponsible) {
      return { visible: true, canCreate: true, canEdit: true, canDelete: true };
    }
    return defaultPerms;
  };
  const isSuperOrSec = authenticatedUser?.id === '1' || authenticatedUser?.role === 'admin' || authenticatedUser?.role === 'secretaria';

  return (
    <div className={`h-screen w-full transition-all duration-500 ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}>
        {view === 'login' && (
          <LoginScreen 
            settings={derivedSettings} 
            translation={t} 
            pin={pin} 
            isError={isPinError} 
            isLight={isLight} 
            onPinChange={setPin} 
            onNumberClick={n => setPin(p => p.length < 4 ? p + n : p)} 
            onDelete={() => setPin(p => p.slice(0, -1))} 
            onRegister={() => setView('register')} 
            onConfirm={() => handleLogin(pin)} 
            onLanguageSelect={() => {}} 
            onToggleTheme={() => setLocalTheme(prev => prev === 'light' ? 'dark' : 'light')}
            onForgotPin={async (data) => {
              const notif = {
                id: `NTF-${Date.now()}`,
                title: 'PIN Reset Request',
                message: `User ${data.firstName} ${data.lastName} (${data.phone}) requested a PIN reset.`,
                timestamp: new Date().toISOString(),
                senderPhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${data.firstName} ${data.lastName}`)}&background=random`,
                senderName: `${data.firstName} ${data.lastName}`,
                senderId: 'system',
                targetType: 'role' as const,
                targetId: 'admin',
                readBy: [],
                deletedBy: [],
                sendPush: true
              };
              await handleDataChange('notifications', 'CREATE', notif);
            }} 
          />
        )}
        
        {view === 'register' && <MemberSelfRegistration translation={t} settings={derivedSettings} countriesList={countries} onBack={() => setView('login')} onComplete={handleRegistrationComplete} />}
        {view === 'registrationSuccess' && <RegistrationSuccess pin={registeredPin} translation={t} isLight={isLight} onClose={() => setView('login')} />}
        {view === 'loading' && authenticatedUser && <LoadingScreen user={authenticatedUser} settings={derivedSettings} translation={t} onComplete={() => setView('menu')} />}
        
        {view === 'menu' && authenticatedUser && (
          <MainMenu 
            user={authenticatedUser} 
            translation={t} 
            settings={derivedSettings} 
            lang={lang}
            syncStatus={syncStatus} 
            notifications={notifications} 
            members={members}
            onLogout={() => { localStorage.clear(); setView('login'); setAuthenticatedUser(null); }} 
            onToggleTheme={() => setLocalTheme(prev => prev === 'light' ? 'dark' : 'light')} 
            onOpenProfile={() => setView('profile')} 
            onOpenMembers={() => setView('members')} 
            onOpenActivities={() => setView('activities')} 
            onOpenTithes={() => setView('tithes')} 
            onOpenOfferings={() => setView('offerings')} 
            onOpenDonations={() => setView('donations')} 
            onOpenDonateurs={() => setView('donateurs')} 
            onOpenExpenses={() => setView('expenses')} 
            onOpenPrayers={() => setView('prayers')} 
            onOpenAnalytics={() => setView('analytics')} 
            onOpenAttendanceCommunion={() => setView('attendance')} 
            onOpenCalendar={() => setView('calendar')} 
            onOpenSettings={() => setView('settings')} 
            onOpenUsers={() => setView('users')} 
            onOpenBirthdays={() => setView('birthdays')} 
            onOpenMemberTypes={() => setView('memberTypes')} 
            onOpenGenders={() => setView('genders')} 
            onOpenCivilStatus={() => setView('civilStatus')} 
            onOpenNationalities={() => setView('nationalities')} 
            onOpenMemberLanguages={() => setView('languages')} 
            onOpenSpiritualStatus={() => setView('spiritualStatus')} 
            onOpenCountries={() => setView('countries')} 
            onOpenProvinces={() => setView('provinces')} 
            onOpenCities={() => setView('cities')} 
            onOpenDepartments={() => setView('departments')} 
            onOpenSpouseRelationshipTypes={() => setView('spouseRelationshipTypes')} 
            onOpenCommittees={() => setView('committee')} 
            onOpenCommitteeRoles={() => setView('committeeRoles')} 
            onOpenCommitteeTypes={() => setView('committeeTypes')} 
            onOpenExpenseCategories={() => setView('expenseCategories')} 
            onOpenIDTypes={() => setView('idTypes')} 
            onOpenNotifications={() => setView('notifications')} 
            onOpenIncompleteMembers={() => setView('incompleteMembers')} 
            onOpenSundaySchool={() => setView('sundaySchool')}
            onOpenModules={() => setView('modules')}
            onOpenEditRequests={() => setView('edit_requests')}
            systemModules={systemModules}
            onOpenRoleManagement={() => setView('roles')} 
            incompleteCount={members.filter(m => !m.email || !m.phone).length} 
            onOpenSendNotification={() => setShowSendNotif(true)} 
            onRetrySync={() => handleLogin(pin)} 
            onUpdateUser={u => {
              handleDataChange('users', 'UPDATE', u);
              if (u.id === authenticatedUser.id) setAuthenticatedUser(u);
            }}
          />
        )}
        
        {view === 'profile' && authenticatedUser && (
          <ProfileScreen 
            user={authenticatedUser} translation={t} settings={derivedSettings} genders={t.listGenders} onBack={() => setView('menu')} 
            onUpdateUser={u => {
              handleDataChange('users', 'UPDATE', u);
              if (u.id === authenticatedUser.id) setAuthenticatedUser(u);
            }} 
          />
        )}

        {view === 'members' && <MembersScreen currentUser={authenticatedUser!} translation={t} settings={derivedSettings} members={members} onBack={() => setView('menu')} onAddMember={m => handleDataChange('members', 'CREATE', m)} onUpdateMember={handleUpdateMember} onDeleteMember={id => handleDataChange('members', 'DELETE', { id })} permissions={safePerms('members')} />}
        {view === 'activities' && <ActivitiesScreen currentUser={authenticatedUser!} translation={t} settings={derivedSettings} activities={activities} members={members} onBack={() => setView('menu')} onAddActivity={a => handleDataChange('activities', 'CREATE', a)} onUpdateActivity={a => handleDataChange('activities', 'UPDATE', a)} onDeleteActivity={id => handleDataChange('activities', 'DELETE', { id })} permissions={safePerms('activities')} />}
        {view === 'analytics' && <InsightsScreen translation={t} settings={derivedSettings} tithes={tithes} offerings={offerings} donations={donations} expenses={expenses} onBack={() => setView('menu')} />}
        {view === 'birthdays' && <BirthdayScreen translation={t} settings={derivedSettings} members={members} onBack={() => setView('menu')} currentUser={authenticatedUser!} />}
        {view === 'calendar' && <CalendarScreen translation={t} settings={derivedSettings} activities={activities} members={members} currentUser={authenticatedUser!} lang={lang} onBack={() => setView('menu')} onAddActivity={a => handleDataChange('activities', 'CREATE', a)} onUpdateActivity={a => handleDataChange('activities', 'UPDATE', a)} onDeleteActivity={id => handleDataChange('activities', 'DELETE', { id })} isRestricted={!safePerms('calendar').canEdit} permissions={safePerms('calendar')} />}
        {view === 'tithes' && <TitheScreen currentUser={authenticatedUser!} translation={t} settings={derivedSettings} members={members} tithes={tithes} editRequests={editRequests} onBack={() => setView('menu')} onAddTithe={t => handleDataChange('tithes', 'CREATE', t)} onUpdateTithe={t => { handleDataChange('tithes', 'UPDATE', t); handleCompleteEditRequest('tithes', t.id); }} onDeleteTithe={id => handleDataChange('tithes', 'DELETE', { id })} isRestricted={false} permissions={safePerms('tithes')} onRequestEdit={handleRequestEdit} />}
        {view === 'offerings' && <OfferingScreen currentUser={authenticatedUser!} translation={t} offerings={offerings} editRequests={editRequests} settings={derivedSettings} onBack={() => setView('menu')} onAddOffering={o => handleDataChange('offerings', 'CREATE', o)} onUpdateOffering={o => { handleDataChange('offerings', 'UPDATE', o); handleCompleteEditRequest('offerings', o.id); }} onDeleteOffering={id => handleDataChange('offerings', 'DELETE', { id })} permissions={safePerms('offerings')} onRequestEdit={handleRequestEdit} />}
        {view === 'donations' && <DonationScreen currentUser={authenticatedUser!} translation={t} donations={donations} editRequests={editRequests} settings={derivedSettings} onBack={() => setView('menu')} onAddDonation={d => handleDataChange('donations', 'CREATE', d)} onUpdateDonation={d => { handleDataChange('donations', 'UPDATE', d); handleCompleteEditRequest('donations', d.id); }} onDeleteDonation={id => handleDataChange('donations', 'DELETE', { id })} permissions={safePerms('donations')} onRequestEdit={handleRequestEdit} />}
        {view === 'donateurs' && <DonateurScreen currentUser={authenticatedUser!} translation={t} donateurs={donateurs} donateurPayments={donateurPayments} members={members} settings={derivedSettings} onBack={() => setView('menu')} onAddDonateur={d => handleDataChange('donateurs', 'CREATE', d)} onUpdateDonateur={d => handleDataChange('donateurs', 'UPDATE', d)} onDeleteDonateur={id => handleDataChange('donateurs', 'DELETE', { id })} onAddDonateurPayment={p => handleDataChange('donateur_payments', 'CREATE', p)} onUpdateDonateurPayment={p => handleDataChange('donateur_payments', 'UPDATE', p)} onDeleteDonateurPayment={id => handleDataChange('donateur_payments', 'DELETE', { id })} permissions={safePerms('donations')} />}
        {view === 'expenses' && <ExpenseScreen currentUser={authenticatedUser!} translation={t} expenses={expenses} editRequests={editRequests} categories={t.listExpenseCategories} settings={derivedSettings} onBack={() => setView('menu')} onAddExpense={e => handleDataChange('expenses', 'CREATE', e)} onUpdateExpense={e => { handleDataChange('expenses', 'UPDATE', e); handleCompleteEditRequest('expenses', e.id); }} onDeleteExpense={id => handleDataChange('expenses', 'DELETE', { id })} permissions={safePerms('expenses')} onRequestEdit={handleRequestEdit} />}
        {view === 'prayers' && <PrayerScreen currentUser={authenticatedUser!} translation={t} members={members} prayers={prayers} settings={derivedSettings} onBack={() => setView('menu')} onAddPrayer={p => handleDataChange('prayers', 'CREATE', p)} onUpdatePrayer={p => handleDataChange('prayers', 'UPDATE', p)} onDeletePrayer={id => handleDataChange('prayers', 'DELETE', { id })} isRestricted={false} permissions={safePerms('prayers')} />}
        {view === 'attendance' && <AttendanceCommunionScreen currentUser={authenticatedUser!} translation={t} settings={derivedSettings} members={members} activities={activities} attendanceRecords={attendanceRecords} communionRecords={communionRecords} attendanceRegistryActive={attendanceRegistryActive} onBack={() => setView('menu')} onAddAttendance={r => handleDataChange('attendance_records', 'CREATE', r)} onAddCommunion={r => handleDataChange('communion_records', 'CREATE', r)} onDeleteAttendance={id => handleDataChange('attendance_records', 'DELETE', { id })} onDeleteCommunion={id => handleDataChange('communion_records', 'DELETE', { id })} onToggleAttendanceRegistry={(id, s) => set(ref(db, `settings/attendance_active/${id}`), s)} onUpdateMember={()=>{}} isRestricted={false} />}
        {view === 'users' && <UsersManagement users={users} currentUser={authenticatedUser!} translation={t} settings={derivedSettings} genders={t.listGenders} onBack={() => setView('menu')} onAddUser={u => handleDataChange('users', 'CREATE', u)} onUpdateUser={u => handleDataChange('users', 'UPDATE', u)} />}
        {view === 'settings' && <SettingsScreen settings={derivedSettings} translation={t} currentLang={lang} syncStatus={syncStatus} onBack={() => setView('menu')} onUpdateSettings={s => set(ref(db, 'settings/global'), s)} onUpdateLang={() => {}} localData={{}} onBatchUpdate={async ()=>true} currentUser={authenticatedUser!} />}
        {view === 'memberTypes' && <MemberTypesScreen translation={t} settings={derivedSettings} memberTypes={t.listMemberTypes} onBack={() => setView('menu')} onAddType={t => handleDataChange('member_types', 'CREATE', t)} onUpdateType={(old, n) => handleDataChange('member_types', 'UPDATE', n)} onDeleteType={t => handleDataChange('member_types', 'DELETE', t)} />}
        {view === 'genders' && <GendersScreen translation={t} settings={derivedSettings} genders={t.listGenders} onBack={() => setView('menu')} onAddGender={g => handleDataChange('genders', 'CREATE', g)} onUpdateGender={(old, n) => handleDataChange('genders', 'UPDATE', n)} onDeleteGender={g => handleDataChange('genders', 'DELETE', g)} />}
        {view === 'civilStatus' && <CivilStatusScreen translation={t} settings={derivedSettings} statuses={t.listCivilStatuses} onBack={() => setView('menu')} onAddStatus={s => handleDataChange('civil_statuses', 'CREATE', s)} onUpdateStatus={(old, n) => handleDataChange('civil_statuses', 'UPDATE', n)} onDeleteStatus={s => handleDataChange('civil_statuses', 'DELETE', s)} />}
        {view === 'nationalities' && <NationalityScreen translation={t} settings={derivedSettings} nationalities={t.listNationalities} onBack={() => setView('menu')} onAddNationality={n => handleDataChange('nationalities', 'CREATE', n)} onUpdateNationality={(old, n) => handleDataChange('nationalities', 'UPDATE', n)} onDeleteNationality={n => handleDataChange('nationalities', 'DELETE', n)} />}
        {view === 'languages' && <MemberLanguagesScreen translation={t} settings={derivedSettings} languages={t.listLanguages} onBack={() => setView('menu')} onAddLanguage={l => handleDataChange('member_languages', 'CREATE', l)} onUpdateLanguage={(old, n) => handleDataChange('member_languages', 'UPDATE', n)} onDeleteLanguage={l => handleDataChange('member_languages', 'DELETE', l)} />}
        {view === 'spiritualStatus' && <SpiritualStatusScreen translation={t} settings={derivedSettings} statuses={t.listSpiritualStatuses} onBack={() => setView('menu')} onAddStatus={s => handleDataChange('spiritual_statuses', 'CREATE', s)} onUpdateStatus={(old, n) => handleDataChange('spiritual_statuses', 'UPDATE', n)} onDeleteStatus={s => handleDataChange('spiritual_statuses', 'DELETE', s)} />}
        {view === 'countries' && <CountryManagementScreen translation={t} settings={derivedSettings} countries={countries} onBack={() => setView('menu')} onAdd={c => handleDataChange('countries', 'CREATE', c)} onUpdate={c => handleDataChange('countries', 'UPDATE', c)} onDelete={id => handleDataChange('countries', 'DELETE', {id})} />}
        {view === 'provinces' && <ProvinceManagementScreen translation={t} settings={derivedSettings} countries={countries} provinces={provinces} onBack={() => setView('menu')} onAdd={p => handleDataChange('provinces', 'CREATE', p)} onUpdate={p => handleDataChange('provinces', 'UPDATE', p)} onDelete={id => handleDataChange('provinces', 'DELETE', {id})} />}
        {view === 'cities' && <CityManagementScreen translation={t} settings={derivedSettings} provinces={provinces} cities={cities} onBack={() => setView('menu')} onAdd={c => handleDataChange('cities', 'CREATE', c)} onUpdate={c => handleDataChange('cities', 'UPDATE', c)} onDelete={id => handleDataChange('cities', 'DELETE', {id})} />}
        {view === 'departments' && <DepartmentsScreen translation={t} settings={derivedSettings} departments={t.listDepartments} onBack={() => setView('menu')} onAddDepartment={d => handleDataChange('departments', 'CREATE', d)} onUpdateDepartment={(old, n) => handleDataChange('departments', 'UPDATE', n)} onDeleteDepartment={d => handleDataChange('departments', 'DELETE', d)} />}
        {view === 'spouseRelationshipTypes' && <SpouseRelationshipTypesScreen translation={t} settings={derivedSettings} types={t.listSpouseRelationshipTypes} onBack={() => setView('menu')} onAddType={t => handleDataChange('spouse_relationship_types', 'CREATE', t)} onUpdateType={(old, n) => handleDataChange('spouse_relationship_types', 'UPDATE', n)} onDeleteType={t => handleDataChange('spouse_relationship_types', 'DELETE', t)} />}
        {view === 'committee' && <CommitteeScreen translation={t} settings={derivedSettings} members={members} committees={committees} departments={t.listDepartments} committeeRoles={committeeRoles} committeeTypes={t.listCommitteeTypes} onBack={() => setView('menu')} onAdd={c => handleDataChange('committees', 'CREATE', c)} onUpdate={c => handleDataChange('committees', 'UPDATE', c)} onDelete={id => handleDataChange('committees', 'DELETE', {id})} />}
        {view === 'committeeRoles' && <CommitteeRolesScreen translation={t} settings={derivedSettings} roles={committeeRoles} onBack={() => setView('menu')} onAdd={r => handleDataChange('committee_roles', 'CREATE', r)} onUpdate={r => handleDataChange('committee_roles', 'UPDATE', r)} onDelete={id => handleDataChange('committee_roles', 'DELETE', {id})} />}
        {view === 'committeeTypes' && <CommitteeTypesScreen translation={t} settings={derivedSettings} types={t.listCommitteeTypes} onBack={() => setView('menu')} onAdd={t => handleDataChange('committee_types', 'CREATE', t)} onUpdate={(old, n) => handleDataChange('committee_types', 'UPDATE', n)} onDelete={t => handleDataChange('committee_types', 'DELETE', t)} />}
        {view === 'expenseCategories' && <ExpenseCategoriesScreen translation={t} settings={derivedSettings} categories={t.listExpenseCategories} onBack={() => setView('menu')} onAddCategory={c => handleDataChange('expense_categories', 'CREATE', c)} onUpdateCategory={(old, n) => handleDataChange('expense_categories', 'UPDATE', n)} onDeleteCategory={c => handleDataChange('expense_categories', 'DELETE', c)} />}
        {view === 'idTypes' && <IDTypesScreen translation={t} settings={derivedSettings} idTypes={t.listIDTypes} onBack={() => setView('menu')} onAddType={t => handleDataChange('id_types', 'CREATE', t)} onUpdateType={(old, n) => handleDataChange('id_types', 'UPDATE', n)} onDeleteType={t => handleDataChange('id_types', 'DELETE', t)} />}
        {view === 'notifications' && authenticatedUser && <NotificationCenter notifications={notifications} currentUser={authenticatedUser} isLight={isLight} translation={t} onBack={() => setView('menu')} onMarkAsRead={handleMarkNotificationRead} onDelete={handleDeleteNotification} onClearAll={handleClearNotifications} onNavigate={(url) => setView(url)} />}
        {view === 'incompleteMembers' && <IncompleteMembersScreen members={members} translation={t} settings={derivedSettings} onBack={() => setView('menu')} onEditMember={()=>{}} />}
        {view === 'sundaySchool' && authenticatedUser && <SundaySchoolScreen translation={t} settings={derivedSettings} classes={sundaySchoolClasses} students={sundaySchoolStudents} members={members} currentUser={authenticatedUser} reports={sundaySchoolReports} attendance={sundaySchoolAttendance} onBack={() => setView('menu')} onAddClass={c => handleDataChange('sunday_school_classes', 'CREATE', c)} onUpdateClass={c => handleDataChange('sunday_school_classes', 'UPDATE', c)} onDeleteClass={id => handleDataChange('sunday_school_classes', 'DELETE', {id})} onAddStudent={s => handleDataChange('sunday_school_students', 'CREATE', s)} onUpdateStudent={s => handleDataChange('sunday_school_students', 'UPDATE', s)} onDeleteStudent={id => handleDataChange('sunday_school_students', 'DELETE', {id})} onAddReport={r => handleDataChange('sunday_school_reports', 'CREATE', r)} onUpdateReport={r => handleDataChange('sunday_school_reports', 'UPDATE', r)} onDeleteReport={id => handleDataChange('sunday_school_reports', 'DELETE', {id})} onAddAttendance={a => handleDataChange('sunday_school_attendance', 'CREATE', a)} onUpdateSettings={s => set(ref(db, 'settings/global'), s)} />}
        {view === 'modules' && authenticatedUser && <ModulesScreen modules={systemModules} users={users} roles={['admin', 'secretaria', 'contable', 'user']} translation={t} theme={derivedSettings.theme} onAdd={m => handleDataChange('system_modules', 'CREATE', { ...m, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })} onUpdate={(id, m) => handleDataChange('system_modules', 'UPDATE', { id, ...m, updatedAt: new Date().toISOString() })} onDelete={id => handleDataChange('system_modules', 'DELETE', { id })} onBack={() => setView('menu')} />}
        {view === 'edit_requests' && authenticatedUser && <EditRequestsScreen requests={editRequests} modules={systemModules} users={users} currentUser={authenticatedUser} translation={t} theme={derivedSettings.theme} onApprove={id => {
          const req = editRequests.find(r => r.id === id);
          if (!req) return;
          const expires = new Date();
          expires.setMinutes(expires.getMinutes() + 5);
          handleDataChange('edit_requests', 'UPDATE', { ...req, status: 'approved', approvedAt: new Date().toISOString(), expiresAt: expires.toISOString() });
          
          const notif = {
            id: Date.now().toString(),
            title: 'Edit Request Approved',
            message: `Your request to edit in the ${req.moduleId} module has been approved. You have 5 minutes to make the changes.`,
            timestamp: new Date().toISOString(),
            senderPhoto: authenticatedUser?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System')}&background=random`,
            senderName: authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System',
            senderId: authenticatedUser?.id,
            targetType: 'individual' as const,
            targetId: req.requesterId,
            readBy: [],
            deletedBy: [],
            actionUrl: req.screenId,
            sendPush: true
          };
          handleDataChange('notifications', 'CREATE', notif);
        }} onReject={id => {
          const req = editRequests.find(r => r.id === id);
          if (!req) return;
          handleDataChange('edit_requests', 'UPDATE', { ...req, status: 'rejected' });
          
          const notif = {
            id: Date.now().toString(),
            title: 'Edit Request Rejected',
            message: `Your request to edit in the ${req.moduleId} module has been rejected.`,
            timestamp: new Date().toISOString(),
            senderPhoto: authenticatedUser?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System')}&background=random`,
            senderName: authenticatedUser ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'System',
            senderId: authenticatedUser?.id,
            targetType: 'individual' as const,
            targetId: req.requesterId,
            readBy: [],
            deletedBy: [],
            actionUrl: 'edit_requests',
            sendPush: true
          };
          handleDataChange('notifications', 'CREATE', notif);
        }} onBack={() => setView('menu')} />}
        {view === 'roles' && <RoleManagementScreen translation={t} settings={derivedSettings} onBack={() => setView('menu')} />}

        {showSendNotif && authenticatedUser && <SendNotificationModal isLight={isLight} translation={t} onClose={() => setShowSendNotif(false)} onSend={handleSendNotification} currentUser={authenticatedUser} members={members} users={users} />}
      </Suspense>
      <InstallPrompt />
    </div>
  );
};

export default App;
