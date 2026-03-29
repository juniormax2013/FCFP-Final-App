
export type Language = 'en';
export type UserRole = 'admin' | 'secretaria' | 'contable' | 'user';
export type ThemeMode = 'light' | 'dark';

export interface ModulePermission {
  visible: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface GeoCountry { id: string; name: string; }
export interface GeoProvince { id: string; name: string; countryId: string; }
export interface GeoCity { id: string; name: string; provinceId: string; }

// Added Translation alias for Record of languages
export interface Translation {
  [key: string]: any;
}

export type Translations = Record<Language, Translation>;

// Added ActivityCategory type
export type ActivityCategory = 'Spiritual' | 'Youth' | 'Service' | 'Education';

// Added Audit related interfaces
export interface Audit {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  timestamp: string;
}

export type TitheAudit = Audit;
export type OfferingAudit = Audit;
export type DonationAudit = Audit;
export type ExpenseAudit = Audit;
export type PrayerAudit = Audit;

export interface SystemSettings {
  systemName: string;
  systemLogo: string | null;
  theme: ThemeMode;
  allowMemberRegistration: boolean;
  showRegistrationPin: boolean;
  planStatus?: 'active' | 'inactive';
  googleSheets: {
    status: string;
    lastVerification: string | null;
    spreadsheetId: string | null;
    principalEmail: string | null;
    authType: string;
    logs: string[];
  };
  enabledModules: {
    members: boolean;
    activities: boolean;
    tithes: boolean;
    offerings: boolean;
    donations: boolean;
    expenses: boolean;
    prayers: boolean;
    analytics: boolean;
    birthdays: boolean;
    committee: boolean;
    calendar: boolean;
    attendanceCommunion: boolean;
    idTypes: boolean;
    countries: boolean;
    provinces: boolean;
    cities: boolean;
    civilStatus: boolean;
    nationalities: boolean;
    languages: boolean;
    spiritualStatus: boolean;
    memberTypes: boolean;
    departments: boolean;
    spouseRelationshipTypes: boolean;
    userManagement: boolean;
    roleManagement: boolean;
    expenseCategories: boolean;
    committeeRoles: boolean;
    committeeTypes: boolean;
  };
  rolePermissions: Record<string, Record<string, ModulePermission>>;
  sundaySchoolCutoffTime?: string; // HH:mm format
}

export interface SundaySchoolClass {
  id: string;
  name: string;
  image: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type SundaySchoolStudentStatus = 'Regular Visitor' | 'Normal' | 'Upcoming Member';

export interface SundaySchoolStudent {
  id: string;
  classId: string;
  memberId?: string; // If they are a registered member
  isGuest: boolean;
  firstName?: string; // For guests
  lastName?: string; // For guests
  status?: SundaySchoolStudentStatus; // For guests
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SundaySchoolReport {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  bibles: number;
  songbooks: number;
  guests: number;
  offering: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SundaySchoolAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  classId: string;
  arrivalTime: string; // HH:mm
  status: 'on_time' | 'late';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  pin: string;
  role: UserRole;
  memberType?: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
  fcmToken?: string;
  menuConfig?: {
    groups: { id: string; name: string; items: string[]; isOpen: boolean }[];
    order: string[];
  };
  updatedAt: string;
  deletedAt: string | null;
}

// Updated Member interface with family and emergency fields
export interface Donateur {
  id: string;
  name: string;
  memberId?: string; // If linked to a member
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DonateurPayment {
  id: string;
  donateurId: string;
  amount: number;
  month: string; // YYYY-MM
  date: string; // ISO string
  registeredBy: string; // User ID or Name
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Member {
  id: string;
  pin?: string;
  photo: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  civilStatus: string;
  nationality: string;
  primaryLanguage: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
  entryDate: string;
  spiritualStatus: string;
  memberType: string;
  department: string;
  churchRole: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdAt?: string;
  createdBy?: string;
  conversionDate?: string;
  baptismDate?: string;
  baptismPlace?: string;
  membershipStatus?: string;
  // New Family Fields
  spouseName?: string;
  spouseRelationship?: string;
  emergencyName?: string;
  emergencyPhone?: string;
}

export interface ActivityParticipant {
  id?: string;
  name: string;
  role: string;
  photo?: string;
}

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  status: 'Active' | 'Inactive' | 'Ongoing' | 'Cancelled';
  time: string;
  address: string;
  department: string;
  image: string;
  participants?: ActivityParticipant[];
  createdBy: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Updated Tithe interface with audit fields
export interface Tithe {
  id: string;
  memberId: string;
  memberName: string;
  memberPhoto: string;
  amount: number;
  date: string;
  notes: string;
  updatedAt: string;
  deletedAt?: string | null;
  registeredBy?: string;
  registeredById?: string;
  audits?: TitheAudit[];
}

// Updated Offering interface with audit fields
export interface Offering { 
  id: string; 
  amount: number; 
  type: string; 
  date: string; 
  notes: string; 
  updatedAt: string; 
  deletedAt?: string | null; 
  registeredBy?: string; 
  registeredById?: string;
  audits: OfferingAudit[];
}

// Updated Donation interface with audit fields
export interface Donation { 
  id: string; 
  amount: number; 
  donorName: string; 
  purpose: string; 
  date: string; 
  notes: string; 
  updatedAt: string; 
  deletedAt?: string | null; 
  registeredBy?: string; 
  registeredById?: string;
  audits: DonationAudit[];
}

// Updated Expense interface with audit fields
export interface Expense { 
  id: string; 
  amount: number; 
  category: string; 
  description: string; 
  date: string; 
  updatedAt: string; 
  deletedAt?: string | null; 
  registeredBy?: string; 
  registeredById?: string;
  audits: ExpenseAudit[];
}

// Updated Prayer interface with audit fields
export interface Prayer { 
  id: string; 
  personName: string; 
  reason: string; 
  isUrgent: boolean; 
  date: string; 
  updatedAt: string; 
  deletedAt?: string | null; 
  memberId?: string; 
  memberPhoto?: string;
  notes?: string;
  registeredBy?: string;
  registeredById?: string;
  audits: PrayerAudit[];
}

// Added Committee related interfaces
export interface CommitteeMember {
  id: string;
  memberId: string;
  name: string;
  photo: string;
  position: string;
  order: number;
}

export interface Committee {
  id: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
  members: CommitteeMember[];
  logo: string | null;
  createdAt: string;
}

export interface CommitteeRole {
  id: string;
  name: string;
  description: string;
}

// Added Attendance and Communion interfaces
export interface AttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  timestamp: string;
}

export interface CommunionRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  timestamp: string;
}

// Updated SyncStatus to include missing error and count fields
export interface SyncStatus {
  status: 'match' | 'syncing' | 'error' | 'offline' | 'pending' | 'unconfigured' | 'mismatch';
  lastSyncAt: string | null;
  pendingCount: number;
  lastError?: string | null;
  receivedCount?: number;
}

// Added SyncQueueItem interface
export interface SyncQueueItem {
  id: string;
  table: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
}

// Added VerificationResult interface
export interface VerificationResult {
  status: 'connected' | 'error';
  message: string;
  spreadsheetId: string;
  principalEmail: string;
  authType: string;
  details: string[];
}

export interface SystemModule {
  id: string;
  name: string;
  image: string | null;
  screens: string[];
  roles: string[];
  responsibleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditRequest {
  id: string;
  moduleId: string;
  screenId: string;
  recordId: string;
  requesterId: string;
  responsibleId: string;
  whatToEdit: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  senderPhoto: string;
  senderName: string;
  senderId?: string;
  timestamp: string;
  readBy: string[];
  deletedBy: string[];
  targetType: 'all' | 'role' | 'individual';
  targetId?: string;
  actionUrl?: string;
  actionData?: any;
  sendPush?: boolean;
}
