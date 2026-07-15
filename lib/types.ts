export type RoleKey =
  | 'owner'
  | 'ops_manager'
  | 'restaurant_gm'
  | 'bar_manager'
  | 'apartment_manager'
  | 'recruitment_specialist'
  | 'logistics_coordinator'
  | 'personal_assistant'
  | 'accountant';

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
}

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
  rssb_maternity: 'RSSB — Maternity (employer)',
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

export interface ActivityEntry {
  id: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  actor: { name: string; role: { key: RoleKey; label: string } } | null;
}

export type TaskScope = 'my' | 'team' | 'all';

// Mirrors backend/lib/RoleHierarchy.php — used for UI decisions only
// (which tabs/dropdown options to show). The server is the source of
// truth and re-checks this on every write; this map never grants real
// authorization. Strictly direct-report lines from the org chart: a
// manager who wants work done outside their own direct reports routes
// it through the person who actually manages that role.
export const ASSIGNABLE_ROLES: Record<RoleKey, RoleKey[]> = {
  owner: ['ops_manager', 'personal_assistant', 'accountant'],
  ops_manager: ['restaurant_gm', 'apartment_manager', 'recruitment_specialist', 'logistics_coordinator'],
  restaurant_gm: ['bar_manager'],
  bar_manager: [],
  apartment_manager: [],
  recruitment_specialist: [],
  logistics_coordinator: [],
  personal_assistant: [],
  accountant: [],
};

// Mirrors backend/handlers/tasks_handler.php's HIDDEN_FROM_OPS_MANAGER — the
// Operations Manager oversees the four department heads, not the Owner's
// own work or the Personal Assistant's. Used here only to drive the UI
// (skip a doomed fetch, show the same clean "no visibility" message as any
// other unauthorized case); the backend re-checks this on every request
// regardless.
export const HIDDEN_FROM_OPS_MANAGER: RoleKey[] = ['owner', 'personal_assistant'];
