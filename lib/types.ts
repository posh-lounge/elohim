export type RoleKey =
  | 'owner'
  | 'ops_manager'
  | 'restaurant_gm'
  | 'bar_manager'
  | 'apartment_manager'
  | 'recruitment_specialist'
  | 'logistics_coordinator'
  | 'personal_assistant';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Role {
  key: RoleKey;
  label: string;
  department: string;
  reportsTo: RoleKey | null;
  purpose: string;
  responsibilities: string[];
  kpis: string[];
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
  updates: TaskUpdate[];
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: { key: RoleKey; label: string };
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
  owner: ['ops_manager', 'personal_assistant'],
  ops_manager: ['restaurant_gm', 'apartment_manager', 'recruitment_specialist', 'logistics_coordinator'],
  restaurant_gm: ['bar_manager'],
  bar_manager: [],
  apartment_manager: [],
  recruitment_specialist: [],
  logistics_coordinator: [],
  personal_assistant: [],
};
