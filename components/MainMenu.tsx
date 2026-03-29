
import React, { useState, useEffect } from 'react';
import { 
  LogOut, Settings, User as UserIcon, Calendar as CalendarIcon, Users, Contact, 
  Tag, Cake, DollarSign, Wallet, HeartHandshake, ReceiptText, MessageSquareHeart, 
  BarChart3, ShieldCheck, Heart, Globe, MessageCircle, Flame, Map, Navigation, 
  ChevronRight, Briefcase, LayoutPanelTop, QrCode, Sun, Moon, 
  ListTree, Bell, Send, IdCard, UserCheck2, ClipboardList, MapPin, Layers, LayoutGrid, Menu, X, BookOpen,
  Edit2, Plus, ArrowUp, ArrowDown, Folder, FolderOpen, Trash2, ArrowDownAZ, ArrowUpZA, Search
} from 'lucide-react';
import { User, Translation, SystemSettings, Language, SyncStatus, AppNotification, Member } from '../types.ts';
import { ChurchLogo } from './ChurchLogo.tsx';
import { SyncBadge } from './SyncBadge.tsx';

interface MainMenuProps {
  user: User;
  translation: Translation;
  settings: SystemSettings;
  lang: Language;
  onLogout: () => void;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onOpenUsers: () => void;
  onOpenActivities: () => void;
  onOpenMembers: () => void;
  onOpenMemberTypes: () => void;
  onOpenGenders: () => void;
  onOpenBirthdays: () => void;
  onOpenTithes: () => void;
  onOpenOfferings: () => void;
  onOpenDonations: () => void;
  onOpenDonateurs: () => void;
  onOpenExpenses: () => void;
  onOpenPrayers: () => void;
  onOpenExpenseCategories: () => void;
  onOpenAnalytics: () => void;
  onOpenRoleManagement: () => void;
  onOpenSettings: () => void;
  onOpenCivilStatus: () => void;
  onOpenNationalities: () => void;
  onOpenMemberLanguages: () => void;
  onOpenSpiritualStatus: () => void;
  onOpenCountries: () => void;
  onOpenProvinces: () => void;
  onOpenCities: () => void;
  onOpenDepartments: () => void;
  onOpenSpouseRelationshipTypes: () => void;
  onOpenCalendar: () => void;
  onOpenCommittees: () => void;
  onOpenCommitteeRoles: () => void;
  onOpenCommitteeTypes: () => void;
  onOpenAttendanceCommunion: () => void;
  onOpenIDTypes: () => void;
  onOpenNotifications: () => void;
  onOpenSendNotification: () => void;
  onOpenIncompleteMembers: () => void;
  onOpenSundaySchool: () => void;
  onOpenModules: () => void;
  onOpenEditRequests: () => void;
  systemModules?: any[];
  incompleteCount: number;
  syncStatus: SyncStatus;
  onRetrySync: () => void;
  onUpdateUser?: (user: User) => void;
  notifications: AppNotification[];
  members: Member[];
  isRestricted?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ 
  user, translation, settings, lang, onLogout, onToggleTheme,
  onOpenProfile, onOpenUsers, onOpenActivities, onOpenMembers,
  onOpenMemberTypes, onOpenGenders, onOpenBirthdays, onOpenTithes,
  onOpenOfferings, onOpenDonations, onOpenDonateurs, onOpenExpenses,
  onOpenPrayers, onOpenExpenseCategories, onOpenAnalytics,
  onOpenRoleManagement, onOpenSettings,
  onOpenCivilStatus, onOpenNationalities, onOpenMemberLanguages, onOpenSpiritualStatus,
  onOpenCountries, onOpenProvinces, onOpenCities,
  onOpenDepartments, onOpenSpouseRelationshipTypes, onOpenCalendar,
  onOpenCommittees, onOpenCommitteeRoles, onOpenCommitteeTypes,
  onOpenAttendanceCommunion, onOpenIDTypes,
  onOpenNotifications, onOpenSendNotification, onOpenIncompleteMembers, onOpenSundaySchool,
  onOpenModules, onOpenEditRequests, systemModules = [],
  incompleteCount,
  syncStatus, onRetrySync, notifications, members, isRestricted
}) => {
  const isLight = settings.theme === 'light';
  const isSuperUser = user.id === '1';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  
  const [groupModalState, setGroupModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'rename';
    groupId?: string;
    initialName?: string;
  }>({ isOpen: false, mode: 'add' });
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    groupId: string;
  }>({ isOpen: false, groupId: '' });
  const [groupNameInput, setGroupNameInput] = useState('');
  
  const [menuConfig, setMenuConfig] = useState<{
    groups: { id: string; name: string; items: string[]; isOpen: boolean }[];
    order: string[];
  }>(() => {
    const saved = localStorage.getItem(`menu_config_${user.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const seen = new Set<string>();
        const dedupedGroups = parsed.groups.map((g: any) => {
          const items = g.items.filter((id: string) => {
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          return { ...g, items };
        });
        const dedupedOrder = parsed.order.filter((id: string) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return { groups: dedupedGroups, order: dedupedOrder };
      } catch (e) {}
    }
    return { groups: [], order: [] };
  });

  useEffect(() => {
    localStorage.setItem(`menu_config_${user.id}`, JSON.stringify(menuConfig));
  }, [menuConfig, user.id]);

  const hasSecretarialAccess = isSuperUser || user.role === 'admin' || user.role === 'secretaria';
  const hasFinancialAccess = isSuperUser || user.role === 'admin' || user.role === 'secretaria' || user.role === 'contable';
  const isModuleResponsible = systemModules.some(m => m.responsibleId === user.id);

  const unreadCount = notifications.filter(n => 
    !n.readBy?.includes(user.id) && 
    !n.deletedBy?.includes(user.id) &&
    (n.targetType === 'all' || n.targetId === user.role || n.targetId === user.id)
  ).length;

  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return members
      .filter(m => m.birthDate)
      .map(m => {
        const [year, month, day] = m.birthDate.split('-').map(Number);
        let nextBirthday = new Date(today.getFullYear(), month - 1, day);
        
        if (nextBirthday < today) {
          nextBirthday = new Date(today.getFullYear() + 1, month - 1, day);
        }
        
        const diffTime = nextBirthday.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        return { ...m, daysUntil: diffDays, nextBirthday };
      })
      .filter(m => m.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const appIcons = [
    { id: 'profile', icon: <UserIcon />, name: translation.profile, color: 'text-green-500', action: onOpenProfile, visible: true },
    { id: 'members', icon: <Contact />, name: translation.moduleNames.members, color: 'text-orange-500', action: onOpenMembers, visible: hasSecretarialAccess && settings.enabledModules.members },
    { id: 'attendance', icon: <QrCode />, name: translation.moduleNames.attendanceCommunion, color: 'text-blue-500', action: onOpenAttendanceCommunion, visible: hasSecretarialAccess && settings.enabledModules.attendanceCommunion },
    { id: 'committee', icon: <LayoutPanelTop />, name: translation.moduleNames.committee, color: 'text-indigo-500', action: onOpenCommittees, visible: hasSecretarialAccess && settings.enabledModules.committee },
    { id: 'prayers', icon: <MessageSquareHeart />, name: translation.moduleNames.prayers, color: 'text-sky-500', action: onOpenPrayers, visible: hasSecretarialAccess && settings.enabledModules.prayers },
    { id: 'send_notif', icon: <Send />, name: "Enviar Notificación", color: 'text-blue-600', action: onOpenSendNotification, visible: hasSecretarialAccess },
    { id: 'analytics', icon: <BarChart3 />, name: translation.moduleNames.analytics, color: 'text-indigo-500', action: onOpenAnalytics, visible: hasFinancialAccess && settings.enabledModules.analytics },
    { id: 'tithes', icon: <DollarSign />, name: translation.moduleNames.tithes, color: 'text-emerald-600', action: onOpenTithes, visible: hasFinancialAccess && settings.enabledModules.tithes },
    { id: 'offerings', icon: <Wallet />, name: translation.moduleNames.offerings, color: 'text-indigo-600', action: onOpenOfferings, visible: hasFinancialAccess && settings.enabledModules.offerings },
    { id: 'donations', icon: <HeartHandshake />, name: translation.moduleNames.donations, color: 'text-rose-600', action: onOpenDonations, visible: hasFinancialAccess && settings.enabledModules.donations },
    { id: 'donateurs', icon: <UserIcon />, name: 'Donateurs', color: 'text-rose-500', action: onOpenDonateurs, visible: hasFinancialAccess && settings.enabledModules.donations },
    { id: 'expenses', icon: <ReceiptText />, name: translation.moduleNames.expenses, color: 'text-orange-600', action: onOpenExpenses, visible: hasFinancialAccess && settings.enabledModules.expenses },
    { id: 'calendar', icon: <CalendarIcon />, name: translation.moduleNames.calendar, color: 'text-blue-600', action: onOpenCalendar, visible: isSuperUser || settings.enabledModules.calendar },
    { id: 'activities', icon: <CalendarIcon />, name: translation.moduleNames.activities, color: 'text-red-500', action: onOpenActivities, visible: isSuperUser || settings.enabledModules.activities },
    { id: 'sunday_school', icon: <BookOpen />, name: translation.moduleNames.sundaySchool || 'Sunday School', color: 'text-blue-400', action: onOpenSundaySchool, visible: hasSecretarialAccess || user.role === 'contable' || isSuperUser },
    { id: 'birthdays', icon: <Cake />, name: translation.moduleNames.birthdays, color: 'text-pink-600', action: onOpenBirthdays, visible: isSuperUser || settings.enabledModules.birthdays },
    { id: 'staff', icon: <UserCheck2 />, name: "Gestión Staff", color: 'text-blue-800', action: onOpenUsers, visible: hasSecretarialAccess },
    { id: 'roles', icon: <ShieldCheck />, name: "Roles & Permisos", color: 'text-slate-700', action: onOpenRoleManagement, visible: isSuperUser },
    { id: 'id_types', icon: <IdCard />, name: "Tipos de ID", color: 'text-gray-600', action: onOpenIDTypes, visible: isSuperUser },
    { id: 'countries', icon: <Globe />, name: "Países", color: 'text-cyan-600', action: onOpenCountries, visible: isSuperUser },
    { id: 'provinces', icon: <Map />, name: "Estados/Provincias", color: 'text-cyan-700', action: onOpenProvinces, visible: isSuperUser },
    { id: 'cities', icon: <MapPin />, name: "Ciudades", color: 'text-cyan-800', action: onOpenCities, visible: isSuperUser },
    { id: 'civil_status', icon: <Heart />, name: "Estados Civiles", color: 'text-rose-400', action: onOpenCivilStatus, visible: isSuperUser },
    { id: 'nationalities', icon: <Globe />, name: "Nacionalidades", color: 'text-sky-700', action: onOpenNationalities, visible: isSuperUser },
    { id: 'languages', icon: <MessageCircle />, name: "Idiomas", color: 'text-teal-600', action: onOpenMemberLanguages, visible: isSuperUser },
    { id: 'spiritual_status', icon: <Flame />, name: "Estatus Espiritual", color: 'text-orange-400', action: onOpenSpiritualStatus, visible: isSuperUser },
    { id: 'member_types', icon: <Tag />, name: "Member Types", color: 'text-amber-600', action: onOpenMemberTypes, visible: isSuperUser },
    { id: 'departments', icon: <Briefcase />, name: "Departamentos", color: 'text-emerald-700', action: onOpenDepartments, visible: isSuperUser },
    { id: 'spouse_rel', icon: <Users />, name: "Vínculos", color: 'text-purple-500', action: onOpenSpouseRelationshipTypes, visible: isSuperUser },
    { id: 'committee_roles', icon: <ClipboardList />, name: "Cargos Comité", color: 'text-indigo-800', action: onOpenCommitteeRoles, visible: isSuperUser },
    { id: 'committee_types', icon: <Layers />, name: "Tipos Comité", color: 'text-indigo-900', action: onOpenCommitteeTypes, visible: isSuperUser },
    { id: 'expense_categories', icon: <ListTree />, name: "Categorías Gasto", color: 'text-orange-400', action: onOpenExpenseCategories, visible: isSuperUser },
    { id: 'modules', icon: <Layers />, name: "Modules", color: 'text-indigo-600', action: onOpenModules, visible: isSuperUser },
    { id: 'edit_requests', icon: <Edit2 />, name: "Edit Requests", color: 'text-amber-500', action: onOpenEditRequests, visible: isSuperUser || user.role === 'admin' || isModuleResponsible },
    { id: 'settings', icon: <Settings />, name: translation.settings, color: 'text-slate-500', action: onOpenSettings, visible: isSuperUser }
  ].filter(app => app.visible);

  // Sync menuConfig with appIcons
  const visibleAppIdsStr = appIcons.map(app => app.id).join(',');
  useEffect(() => {
    setMenuConfig(prev => {
      const visibleAppIds = visibleAppIdsStr.split(',').filter(Boolean);
      const configuredAppIds = new Set([
        ...prev.order,
        ...prev.groups.flatMap(g => g.items)
      ]);

      const missingAppIds = visibleAppIds.filter(id => !configuredAppIds.has(id));
      
      if (missingAppIds.length === 0) return prev;

      return {
        ...prev,
        order: [...prev.order, ...missingAppIds]
      };
    });
  }, [visibleAppIdsStr]);

  const moveItemUp = (index: number, groupId?: string) => {
    setMenuConfig(prev => {
      const next = { ...prev, groups: prev.groups.map(g => ({...g, items: [...g.items]})), order: [...prev.order] };
      if (groupId) {
        const group = next.groups.find(g => g.id === groupId);
        if (group && index > 0) {
          const temp = group.items[index];
          group.items[index] = group.items[index - 1];
          group.items[index - 1] = temp;
        }
      } else {
        if (index > 0) {
          const temp = next.order[index];
          next.order[index] = next.order[index - 1];
          next.order[index - 1] = temp;
        }
      }
      return next;
    });
  };

  const moveItemDown = (index: number, groupId?: string) => {
    setMenuConfig(prev => {
      const next = { ...prev, groups: prev.groups.map(g => ({...g, items: [...g.items]})), order: [...prev.order] };
      if (groupId) {
        const group = next.groups.find(g => g.id === groupId);
        if (group && index < group.items.length - 1) {
          const temp = group.items[index];
          group.items[index] = group.items[index + 1];
          group.items[index + 1] = temp;
        }
      } else {
        if (index < next.order.length - 1) {
          const temp = next.order[index];
          next.order[index] = next.order[index + 1];
          next.order[index + 1] = temp;
        }
      }
      return next;
    });
  };

  const moveGroupUp = (index: number) => {
    if (index === 0) return;
    setMenuConfig(prev => {
      const next = { ...prev, groups: [...prev.groups] };
      const temp = next.groups[index];
      next.groups[index] = next.groups[index - 1];
      next.groups[index - 1] = temp;
      return next;
    });
  };

  const moveGroupDown = (index: number) => {
    setMenuConfig(prev => {
      const next = { ...prev, groups: [...prev.groups] };
      if (index >= next.groups.length - 1) return next;
      const temp = next.groups[index];
      next.groups[index] = next.groups[index + 1];
      next.groups[index + 1] = temp;
      return next;
    });
  };

  const addGroup = () => {
    setGroupNameInput('');
    setGroupModalState({ isOpen: true, mode: 'add' });
  };

  const renameGroup = (groupId: string) => {
    const group = menuConfig.groups.find(g => g.id === groupId);
    if (!group) return;
    setGroupNameInput(group.name);
    setGroupModalState({ isOpen: true, mode: 'rename', groupId, initialName: group.name });
  };

  const deleteGroup = (groupId: string) => {
    setDeleteConfirmState({ isOpen: true, groupId });
  };

  const handleGroupModalSubmit = () => {
    const name = groupNameInput.trim();
    if (!name) return;
    if (groupModalState.mode === 'add') {
      setMenuConfig(prev => ({
        ...prev,
        groups: [...prev.groups, { id: Date.now().toString(), name, items: [], isOpen: true }]
      }));
    } else if (groupModalState.mode === 'rename' && groupModalState.groupId) {
      setMenuConfig(prev => ({
        ...prev,
        groups: prev.groups.map(g => g.id === groupModalState.groupId ? { ...g, name } : g)
      }));
    }
    setGroupModalState({ isOpen: false, mode: 'add' });
  };

  const handleDeleteConfirm = () => {
    const groupId = deleteConfirmState.groupId;
    setMenuConfig(prev => {
      const group = prev.groups.find(g => g.id === groupId);
      if (!group) return prev;
      return {
        groups: prev.groups.filter(g => g.id !== groupId),
        order: [...prev.order, ...group.items]
      };
    });
    setDeleteConfirmState({ isOpen: false, groupId: '' });
  };

  const changeItemGroup = (itemId: string, newGroupId: string | null) => {
    setMenuConfig(prev => {
      const next = { ...prev, groups: prev.groups.map(g => ({...g, items: [...g.items]})), order: [...prev.order] };
      // Remove from current location
      next.order = next.order.filter(id => id !== itemId);
      next.groups.forEach(g => {
        g.items = g.items.filter(id => id !== itemId);
      });

      // Add to new location
      if (newGroupId) {
        const group = next.groups.find(g => g.id === newGroupId);
        if (group) group.items.push(itemId);
      } else {
        next.order.push(itemId);
      }
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    if (isEditingMenu) return; // Don't toggle while editing
    setMenuConfig(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === groupId ? { ...g, isOpen: !g.isOpen } : g)
    }));
  };

  const sortItems = (asc: boolean) => {
    setMenuConfig(prev => {
      const next = { ...prev, groups: prev.groups.map(g => ({...g, items: [...g.items]})), order: [...prev.order] };
      
      const sortFn = (aId: string, bId: string) => {
        const aName = appIcons.find(a => a.id === aId)?.name || '';
        const bName = appIcons.find(a => a.id === bId)?.name || '';
        return asc ? aName.localeCompare(bName) : bName.localeCompare(aName);
      };

      next.order.sort(sortFn);
      next.groups.forEach(g => g.items.sort(sortFn));
      return next;
    });
  };

  const renderMenuItem = (appId: string, index: number, groupId?: string) => {
    const app = appIcons.find(a => a.id === appId);
    if (!app) return null;

    if (isEditingMenu) {
      return (
        <div key={app.id} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl mb-1 border ${isLight ? 'bg-white border-slate-200' : 'bg-[#2a2d35] border-white/10'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`flex items-center justify-center ${app.color}`}>
              {React.cloneElement(app.icon as any, { size: 16 })}
            </div>
            <span className="text-sm font-medium truncate">{app.name}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <select 
              value={groupId || ''} 
              onChange={(e) => changeItemGroup(app.id, e.target.value || null)}
              className={`text-xs rounded px-1 py-1 w-20 ${isLight ? 'bg-slate-100' : 'bg-black/50'}`}
            >
              <option value="">None</option>
              {menuConfig.groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <button onClick={() => moveItemUp(index, groupId)} className="p-1 hover:bg-black/10 rounded"><ArrowUp size={14} /></button>
            <button onClick={() => moveItemDown(index, groupId)} className="p-1 hover:bg-black/10 rounded"><ArrowDown size={14} /></button>
          </div>
        </div>
      );
    }

    return (
      <button 
        key={app.id} 
        onClick={() => {
          app.action();
          setIsSidebarOpen(false);
        }} 
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all active:scale-95 ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 text-white/90'}`}
      >
        <div className={`flex items-center justify-center ${app.color}`}>
          {React.cloneElement(app.icon as any, { size: 20 })}
        </div>
        <span className="text-sm font-semibold">{app.name}</span>
      </button>
    );
  };

  return (
    <div className={`min-h-screen w-full pb-32 font-sans transition-colors duration-300 ${isLight ? 'bg-[#f5f6f8] text-slate-900' : 'bg-[#0f1115] text-white'}`}>
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] z-[101] transform transition-transform duration-300 flex flex-col shadow-2xl ${isLight ? 'bg-white' : 'bg-[#1e2028]'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`p-6 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
          <div className="flex items-center gap-3">
            {settings.systemLogo ? <img src={settings.systemLogo} alt="Logo" className="w-8 h-8 object-contain rounded-full shadow-sm" /> : <ChurchLogo className="w-8 h-8" />}
            <h2 className="font-bold tracking-tight truncate">Menu</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditingMenu(!isEditingMenu)} className={`p-2 rounded-full transition-colors ${isEditingMenu ? 'bg-blue-500 text-white' : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-white/50')}`}>
              <Edit2 size={18} />
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-white/50'}`}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        {isEditingMenu && (
          <div className={`p-3 flex items-center justify-between border-b text-sm ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <button onClick={addGroup} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium">
              <Plus size={16} /> Group
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => sortItems(true)} className="p-1.5 rounded hover:bg-black/10" title="Sort A-Z"><ArrowDownAZ size={16} /></button>
              <button onClick={() => sortItems(false)} className="p-1.5 rounded hover:bg-black/10" title="Sort Z-A"><ArrowUpZA size={16} /></button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className={`p-3 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-black/10'}`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#2a2d35] border-white/10'}`}>
            <Search size={16} className={isLight ? 'text-slate-400' : 'text-white/40'} />
            <input 
              type="text"
              placeholder="Search menu..."
              value={menuSearchTerm}
              onChange={(e) => setMenuSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
            {menuSearchTerm && (
              <button onClick={() => setMenuSearchTerm('')} className="p-1 hover:bg-black/10 rounded-full">
                <X size={14} className={isLight ? 'text-slate-400' : 'text-white/40'} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuSearchTerm.trim() ? (
            <div className="py-2">
              {appIcons
                .filter(app => app.name.toLowerCase().includes(menuSearchTerm.toLowerCase()))
                .map((app, index) => renderMenuItem(app.id, index))}
              {appIcons.filter(app => app.name.toLowerCase().includes(menuSearchTerm.toLowerCase())).length === 0 && (
                <div className="text-center py-8 text-sm text-slate-500">No results found</div>
              )}
            </div>
          ) : (
            <>
              {/* Render Groups */}
              {menuConfig.groups.map((group, gIndex) => (
                <div key={group.id} className="mb-2">
                  <div 
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      {group.isOpen ? <FolderOpen size={16} className="text-blue-500" /> : <Folder size={16} className="text-blue-500" />}
                      {group.name}
                    </div>
                    {isEditingMenu && (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => renameGroup(group.id)} className="p-1 hover:bg-black/10 rounded"><Edit2 size={14} /></button>
                        <button onClick={() => moveGroupUp(gIndex)} className="p-1 hover:bg-black/10 rounded"><ArrowUp size={14} /></button>
                        <button onClick={() => moveGroupDown(gIndex)} className="p-1 hover:bg-black/10 rounded"><ArrowDown size={14} /></button>
                        <button onClick={() => deleteGroup(group.id)} className="p-1 hover:bg-red-500/20 text-red-500 rounded"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                  
                  {group.isOpen && (
                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-blue-500/20 ml-2">
                      {group.items.map((appId, index) => renderMenuItem(appId, index, group.id))}
                      {group.items.length === 0 && isEditingMenu && (
                        <div className="text-xs text-slate-500 italic py-2 px-3">Empty group</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Render Ungrouped Items */}
              {menuConfig.groups.length > 0 && menuConfig.order.length > 0 && isEditingMenu && (
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2 px-3">Ungrouped</div>
              )}
              {menuConfig.order.map((appId, index) => renderMenuItem(appId, index))}
            </>
          )}
        </div>

        <div className={`p-4 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
          <button onClick={onLogout} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all active:scale-95 ${isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
            <LogOut size={18} />
            <span className="text-sm font-bold">{translation.logout}</span>
          </button>
        </div>
      </div>

      {/* Top Bar */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
           <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-full shadow-sm border transition-all active:scale-95 ${isLight ? 'bg-white border-slate-100 text-slate-600' : 'bg-[#1e2028] border-white/5 text-white/70'}`}>
             <Menu size={20} />
           </button>
           <div className="flex items-center gap-2">
             {settings.systemLogo ? <img src={settings.systemLogo} alt="Logo" className="w-8 h-8 object-contain rounded-full shadow-sm hidden sm:block" /> : <ChurchLogo className="w-8 h-8 hidden sm:block" />}
             <h1 className="text-lg font-bold tracking-tight line-clamp-1">{settings.systemName}</h1>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <SyncBadge status={syncStatus} isLight={isLight} onRetry={onRetrySync} />
           <button onClick={onToggleTheme} className={`p-2.5 rounded-full shadow-sm border transition-all active:scale-95 ${isLight ? 'bg-white border-slate-100 text-slate-600' : 'bg-[#1e2028] border-white/5 text-white/70'}`}>
             {isLight ? <Moon size={18} /> : <Sun size={18} />}
           </button>
           <button onClick={onOpenProfile} className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm transition-transform active:scale-95" style={{ borderColor: isLight ? 'white' : '#2a2d35' }}>
             <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
           </button>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-4xl mx-auto mt-2">
        
        {/* Hero Card */}
        <div className="relative rounded-[32px] p-8 overflow-hidden shadow-xl transition-transform hover:scale-[1.01] duration-300" style={{ background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' }}>
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <p className="text-white/90 text-sm font-medium mb-1 tracking-wide">Welcome Back</p>
            <h2 className="text-white text-3xl sm:text-4xl font-bold mb-8 tracking-tight">{user.firstName} {user.lastName}</h2>
            
            <button onClick={onOpenNotifications} className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md border border-white/30 text-white px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-3 w-max shadow-sm active:scale-95">
              {unreadCount > 0 ? (
                <>
                  <div className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm">{unreadCount}</div>
                  You have {unreadCount} new notifications
                </>
              ) : (
                <>
                  <div className="bg-white/20 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm"><ShieldCheck size={14} /></div>
                  {translation.roles[user.role] || user.role}
                </>
              )}
              <ChevronRight size={16} className="opacity-70" />
            </button>
          </div>
        </div>

        {/* Summary Card (Overlapping) */}
        <div className={`rounded-[28px] p-6 shadow-lg border flex items-center justify-between mt-[-40px] relative z-20 mx-4 sm:mx-8 transition-all hover:shadow-xl ${isLight ? 'bg-white border-slate-100' : 'bg-[#1e2028] border-white/5'}`}>
           <div>
             <h3 className="text-lg font-bold mb-1 tracking-tight">Next Activity</h3>
             <p className={`text-sm flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
               <CalendarIcon size={14} /> Sunday Service
             </p>
           </div>
           <button onClick={onOpenActivities} className={`px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-transform active:scale-95 ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-gray-100'}`}>
             View
           </button>
        </div>

        {/* Quick Services */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xl font-bold tracking-tight">Services</h3>
            <button onClick={() => setIsSidebarOpen(true)} className={`text-sm font-medium ${isLight ? 'text-orange-500' : 'text-orange-400'}`}>See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 px-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {appIcons.slice(0, 6).map((app, idx) => (
              <button 
                key={idx} 
                onClick={app.action} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm border transition-all active:scale-95 whitespace-nowrap snap-start ${isLight ? 'bg-white border-slate-100 hover:border-slate-200' : 'bg-[#1e2028] border-white/5 hover:border-white/10'}`}
              >
                <div className={`flex items-center justify-center ${app.color}`}>
                  {React.cloneElement(app.icon as any, { size: 16 })}
                </div>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-white/90'}`}>{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="text-xl font-bold tracking-tight">Events</h3>
            <button onClick={onOpenActivities} className={`text-sm font-medium ${isLight ? 'text-orange-500' : 'text-orange-400'}`}>View All</button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Event Card 1 */}
            <div onClick={onOpenActivities} className={`min-w-[260px] sm:min-w-[300px] snap-center rounded-[28px] p-5 shadow-sm border cursor-pointer transition-transform active:scale-95 ${isLight ? 'bg-white border-slate-100' : 'bg-[#1e2028] border-white/5'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Sunday Service</h4>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Every Sunday, 10:00 AM</p>
                </div>
              </div>
              <div className={`text-xs font-medium px-3 py-2 rounded-xl inline-block ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-white/5 text-white/60'}`}>
                Main Sanctuary
              </div>
            </div>

            {/* Event Card 2 */}
            <div onClick={onOpenActivities} className={`min-w-[260px] sm:min-w-[300px] snap-center rounded-[28px] p-5 shadow-sm border cursor-pointer transition-transform active:scale-95 ${isLight ? 'bg-white border-slate-100' : 'bg-[#1e2028] border-white/5'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Youth Meeting</h4>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Friday, 7:00 PM</p>
                </div>
              </div>
              <div className={`text-xs font-medium px-3 py-2 rounded-xl inline-block ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-white/5 text-white/60'}`}>
                Youth Hall
              </div>
            </div>
          </div>
        </div>

        {/* Birthdays Widget */}
        {(isSuperUser || settings.enabledModules.birthdays) && upcomingBirthdays.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-xl font-bold tracking-tight">Upcoming Birthdays</h3>
              <button onClick={onOpenBirthdays} className={`text-sm font-medium ${isLight ? 'text-pink-500' : 'text-pink-400'}`}>View All</button>
            </div>
            
            <div className={`rounded-[28px] p-5 shadow-sm border ${isLight ? 'bg-white border-slate-100' : 'bg-[#1e2028] border-white/5'}`}>
              <div className="space-y-4">
                {upcomingBirthdays.map((member, idx) => (
                  <div key={member.id} className={`flex items-center justify-between ${idx !== upcomingBirthdays.length - 1 ? 'border-b pb-4' : ''} ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-500">
                        <Cake size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{member.firstName} {member.lastName}</h4>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                          {member.daysUntil === 0 ? 'Today!' : member.daysUntil === 1 ? 'Tomorrow' : `In ${member.daysUntil} days`}
                        </p>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-3 py-1.5 rounded-xl ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-white/5 text-white/60'}`}>
                      {member.nextBirthday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
        <div className={`max-w-md mx-auto flex items-center justify-around p-4 rounded-[32px] shadow-2xl backdrop-blur-xl border pointer-events-auto transition-colors duration-300 ${isLight ? 'bg-white/80 border-slate-200/50' : 'bg-[#1e2028]/80 border-white/10'}`}>
          <button className="flex flex-col items-center gap-1.5 text-orange-500 transition-transform active:scale-90">
            <div className="bg-orange-100 dark:bg-orange-500/20 p-2.5 rounded-full"><LayoutGrid size={22} /></div>
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </button>
          <button onClick={onOpenMembers} className={`flex flex-col items-center gap-1.5 transition-transform active:scale-90 hover:text-orange-400 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
            <div className="p-2.5"><Users size={22} /></div>
            <span className="text-[10px] font-medium tracking-wide">Members</span>
          </button>
          <button onClick={onOpenTithes} className={`flex flex-col items-center gap-1.5 transition-transform active:scale-90 hover:text-orange-400 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
            <div className="p-2.5"><DollarSign size={22} /></div>
            <span className="text-[10px] font-medium tracking-wide">Finances</span>
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className={`flex flex-col items-center gap-1.5 transition-transform active:scale-90 hover:text-orange-400 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
            <div className="p-2.5"><Menu size={22} /></div>
            <span className="text-[10px] font-medium tracking-wide">Menu</span>
          </button>
        </div>
      </div>

      {/* Group Modal */}
      {groupModalState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
              <h2 className="text-lg font-semibold">{groupModalState.mode === 'add' ? 'New Group' : 'Rename Group'}</h2>
              <button onClick={() => setGroupModalState({ isOpen: false, mode: 'add' })} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                autoFocus
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGroupModalSubmit();
                }}
                placeholder="Group name"
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setGroupModalState({ isOpen: false, mode: 'add' })}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-transform active:scale-95 ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGroupModalSubmit}
                  disabled={!groupNameInput.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${isLight ? 'bg-white' : 'bg-[#1e2028]'}`}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Group?</h3>
              <p className={`text-sm mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Are you sure you want to delete this group? Items inside will be moved to the main list.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmState({ isOpen: false, groupId: '' })}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-transform active:scale-95 ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-transform active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
