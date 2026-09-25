export type RoleKey =
  | 'owner'
  | 'ops_manager'
  | 'bar_manager'
  | 'apartment_manager'
  | 'logistics_coordinator'
  | 'personal_assistant'
  | 'accountant'
  | 'interpretation_translation';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface RoleContentItem {
  id: number;
  text: string;
}

export interface Role {
  key: RoleKey;
  label: string;
  department: string;
  reportsTo: RoleKey | null;
  purpose: string;
  responsibilities: RoleContentItem[];
  kpis: RoleContentItem[];
}

export interface TaskUpdate {
  id: number;
  authorRole: RoleKey;
  note: string;
  progress: number;
  ts: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  assignedToRole: RoleKey;
  assignedByRole: RoleKey;
  assignedToEmployee: { id: number; name: string } | null;
  responsibility: RoleContentItem | null;
  updates: TaskUpdate[];
  commentCount: number;
  unreadCommentCount?: number;  // new
}

export interface PaginatedEnvelope {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: { key: RoleKey; label: string };
  employeeId: number | null;
}

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: { key: RoleKey; label: string };
}

export interface DirectoryPerson {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  role: { key: RoleKey; label: string };
  reportsTo: RoleKey | null;
}

export interface KpiEntry {
  id: number;
  value: number;
  periodDate: string;
  note: string | null;
  recordedByRole: RoleKey;
  createdAt: string;
}

export interface KpiDefinition {
  id: number;
  label: string;
  unit: string | null;
  targetValue: number | null;
  roleKey: RoleKey;
  createdAt: string;
  entries: KpiEntry[];
}

export type LeaveStatus = 'pending' | 'approved' | 'denied';

export interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveStatus;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
  user: { id: number; name: string; roleKey: RoleKey };
  decidedByName: string | null;
}

export type EmploymentType = 'permanent' | 'contractor';

// ─── Employee ───────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  position: string;
  department: string;
  employmentType: EmploymentType;
  hireDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  roleKey: RoleKey | null;
  hasSystemAccess: boolean;
  baseSalary?: number;

  // ── Personal information ──────────────────────────────────────────────────
  dateOfBirth: string | null;              // ISO date (YYYY-MM-DD)
  nationalId: string | null;
  address: string | null;

  // ── Emergency contact ─────────────────────────────────────────────────────
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;

  // ── Bank & tax ────────────────────────────────────────────────────────────
  bankAccount: string | null;
  bankName: string | null;
  tinNumber: string | null;
  socialSecurityNumber: string | null;

  // ── Media ─────────────────────────────────────────────────────────────────
  profilePhotoPath: string | null;         // relative path under /uploads
}

/** Fields a PATCH /employees/{id} call may update. */
export interface EmployeeProfileUpdate {
  // Core fields already supported by useUpdateEmployee
  employmentType?: EmploymentType;
  isActive?: boolean;
  phone?: string;
  email?: string;
  notes?: string;
  position?: string;
  department?: string;
  baseSalary?: number;

  // New profile fields
  dateOfBirth?: string;
  nationalId?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bankAccount?: string;
  bankName?: string;
  tinNumber?: string;
  socialSecurityNumber?: string;
}

// ─── Employee documents ─────────────────────────────────────────────────────

export type EmployeeDocumentType =
  | 'national_id'
  | 'contract'
  | 'certificate'
  | 'diploma'
  | 'cv'
  | 'recommendation'
  | 'medical'
  | 'other';

export interface EmployeeDocument {
  id: number;
  documentType: EmployeeDocumentType;
  fileName: string;
  filePath: string;          // relative path under /uploads
  fileSize: number;          // bytes
  fileType: string | null;   // MIME type
  description: string | null;
  uploadedByName: string;
  createdAt: string;
}

export const EMPLOYEE_DOCUMENT_TYPE_LABEL: Record<EmployeeDocumentType, string> = {
  national_id: 'National ID',
  contract: 'Employment Contract',
  certificate: 'Certificate',
  diploma: 'Diploma',
  cv: 'CV / Resume',
  recommendation: 'Recommendation Letter',
  medical: 'Medical Certificate',
  other: 'Other',
};

// ─── Payroll ────────────────────────────────────────────────────────────────

export type PayrollCategory =
  | 'base_salary' | 'bonus' | 'loan' | 'advance'
  | 'rssb_paye' | 'rssb_maternity_employer' | 'rssb_maternity' | 'rssb_mutuelle' | 'rssb_pension' | 'rssb_pension_employer' | 'other';

export interface PayrollEntry {
  id: number;
  employeeId: number;
  employeeName: string;
  employmentType: EmploymentType;
  period: string;
  category: PayrollCategory;
  direction: 'earning' | 'deduction' | 'employer_cost';
  amount: number;
  note: string | null;
  recordedByRole: RoleKey;
  createdAt: string;
}

export const PAYROLL_CATEGORY_LABEL: Record<PayrollCategory, string> = {
  base_salary: 'Base salary',
  bonus: 'Bonus',
  loan: 'Loan',
  advance: 'Advance',
  rssb_paye: 'RSSB — PAYE',
  rssb_maternity_employer: 'RSSB — Maternity (employer)',
  rssb_maternity: 'RSSB — Maternity',
  rssb_mutuelle: 'RSSB — CBHI (Mutuelle)',
  rssb_pension: 'RSSB — Pension (employee)',
  rssb_pension_employer: 'RSSB — Pension (employer)',
  other: 'Other',
};

// Categories only the "Run payroll" batch action can produce — never a
// manual single-entry add, so a re-run can safely replace them in place.
export const AUTO_CALCULATED_CATEGORIES: PayrollCategory[] = [
  'base_salary', 'rssb_pension', 'rssb_pension_employer', 'rssb_maternity', 'rssb_paye', 'rssb_mutuelle',
];
export const MANUAL_PAYROLL_CATEGORIES: PayrollCategory[] = ['bonus', 'loan', 'advance', 'other'];

// ─── Activity ───────────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  actor: { name: string; role: { key: RoleKey; label: string } } | null;
}

// ─── Task scoping ───────────────────────────────────────────────────────────

export type TaskScope = 'my' | 'team' | 'all';

// Mirrors backend/lib/RoleHierarchy.php — used for UI decisions only
// (which tabs/dropdown options to show). The server is the source of
// truth and re-checks this on every write; this map never grants real
// authorization. Strictly direct-report lines from the org chart: a
// manager who wants work done outside their own direct reports routes
// it through the person who actually manages that role.
export const ASSIGNABLE_ROLES: Record<RoleKey, RoleKey[]> = {
  owner: ['ops_manager','personal_assistant', 'accountant','apartment_manager',  'logistics_coordinator' ,'bar_manager','interpretation_translation'],
  ops_manager: [ 'personal_assistant', 'accountant','apartment_manager',  'logistics_coordinator' ,'bar_manager','interpretation_translation'],
  bar_manager: [],
  apartment_manager: [],
  logistics_coordinator: [],
  personal_assistant: [],
  accountant: [],
  interpretation_translation: [],
};

// Mirrors backend/handlers/tasks_handler.php's HIDDEN_FROM_OPS_MANAGER — the
// Operations Manager oversees the four department heads, not the Owner's
// own work or the Personal Assistant's. Used here only to drive the UI
// (skip a doomed fetch, show the same clean "no visibility" message as any
// other unauthorized case); the backend re-checks this on every request
// regardless.
export const HIDDEN_FROM_OPS_MANAGER: RoleKey[] = ['owner'];