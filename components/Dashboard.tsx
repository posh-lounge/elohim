'use client';

import { useState } from 'react';
import { LogOut, Plus, Loader2, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { RoleKey, TaskScope, TaskStatus } from '@/lib/types';
import { ASSIGNABLE_ROLES } from '@/lib/types';
import { useSession, useLogout } from '@/hooks/useSession';
import { useRoles } from '@/hooks/useRoles';
import { useTasks } from '@/hooks/useTasks';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { Dossier } from './Dossier';
import { KanbanBoard } from './KanbanBoard';
import { TaskModal } from './TaskModal';
import { NewTaskModal } from './NewTaskModal';
import { OrgOverview } from './OrgOverview';
import { UsersManagement } from './UsersManagement';
import { AccountModal } from './AccountModal';
import { TeamDirectory } from './TeamDirectory';
import { KpiTracking } from './KpiTracking';
import { LeaveManagement } from './LeaveManagement';
import { ActivityLog } from './ActivityLog';
import { EmployeeRegistry } from './EmployeeRegistry';
import { Payroll } from './Payroll';

type DashboardTab = TaskScope | 'users' | 'directory' | 'kpis' | 'leave' | 'activity' | 'employees' | 'payroll';

export function Dashboard() {
  const router = useRouter();
  const session = useSession();
  const logout = useLogout();
  const rolesQuery = useRoles();

  const [activeTab, setActiveTab] = useState<DashboardTab>('my');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const updateStatus = useUpdateTaskStatus();

  const isTaskTab = activeTab === 'my' || activeTab === 'team' || activeTab === 'all';
  const tasksQuery = useTasks(isTaskTab ? activeTab : 'my');
  const selectedTask = selectedTaskId ? tasksQuery.data?.find((t) => t.id === selectedTaskId) ?? null : null;

  if (session.isLoading || rolesQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading ops console…
      </div>
    );
  }

  if (session.isError || !session.data) {
    router.push('/login');
    return null;
  }

  const user = session.data;
  const roles = rolesQuery.data ?? [];
  const roleLabelByKey = Object.fromEntries(roles.map((r) => [r.key, r.label]));
  const currentRole = roles.find((r) => r.key === user.role.key);
  const assignable = ASSIGNABLE_ROLES[user.role.key] ?? [];
  const canAssign = assignable.length > 0;
  const isTopLevel = user.role.key === 'owner' || user.role.key === 'ops_manager';
  const isOwner = user.role.key === 'owner';
  const isAccountant = user.role.key === 'accountant';
  const canSeeEmployees = isOwner || user.role.key === 'ops_manager' || isAccountant;
  const canSeePayroll = isOwner || isAccountant;
  const newTaskOptions: RoleKey[] = Array.from(new Set([...assignable, user.role.key]));

  const tabs: { key: DashboardTab; label: string }[] = [
    { key: 'my', label: 'My Board' },
    ...(canAssign ? [{ key: 'team' as DashboardTab, label: 'Team Board' }] : []),
    ...(isTopLevel ? [{ key: 'all' as DashboardTab, label: 'Org Overview' }] : []),
    { key: 'kpis', label: 'KPIs' },
    { key: 'leave', label: 'Leave' },
    { key: 'directory', label: 'Directory' },
    ...(isOwner ? [{ key: 'users' as DashboardTab, label: 'Users' }] : []),
    ...(canSeeEmployees ? [{ key: 'employees' as DashboardTab, label: 'Employees' }] : []),
    ...(canSeePayroll ? [{ key: 'payroll' as DashboardTab, label: 'Payroll' }] : []),
    ...(isTopLevel ? [{ key: 'activity' as DashboardTab, label: 'Activity' }] : []),
  ];

  const handleMove = (taskId: number, status: TaskStatus) => updateStatus.mutate({ taskId, status });
  const pendingTaskId = updateStatus.isPending ? updateStatus.variables?.taskId ?? null : null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[rgba(18,21,27,0.94)] backdrop-blur border-b border-border">
        <div className="max-w-[1320px] mx-auto px-4.5 pt-3.5 pb-3">
          <div className="flex justify-between items-center flex-wrap gap-2.5 mb-1">
            <div>
              <div className="font-display text-xl font-bold tracking-wide">ELOHIM GROUP</div>
              <div className="font-mono text-[10.5px] text-faint tracking-widest mt-0.5">OPERATIONS CONSOLE</div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAccount(true)}
                className="flex items-center gap-2 text-right mr-1 hover:opacity-80"
                title="Account settings"
              >
                <div>
                  <div className="text-xs font-semibold">{user.name}</div>
                  <div className="text-[10.5px] text-faint">{user.role.label}</div>
                </div>
                <UserCog size={16} className="text-faint" />
              </button>
              {canAssign && isTaskTab && (
                <button
                  onClick={() => setShowNewTask(true)}
                  className="flex items-center gap-1.5 bg-gold border-none text-[#1A1408] rounded-lg px-3 py-1.5 text-xs font-bold"
                ><Plus size={14} /> New task</button>
              )}
              <button
                onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/login') })}
                className="flex items-center gap-1.5 bg-surface border border-border text-muted rounded-lg px-2.5 py-1.5 text-xs"
              ><LogOut size={13} /> Sign out</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-[1320px] mx-auto px-4.5 pt-4.5 pb-16">
        {currentRole && <Dossier role={currentRole} roleLabelByKey={roleLabelByKey} currentRoleKey={user.role.key} />}

        <div className="flex gap-0 border-b border-border-soft mb-4.5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key} onClick={() => setActiveTab(t.key)}
              className={`bg-transparent border-none py-2 mr-5 text-[13px] font-semibold border-b-2 whitespace-nowrap ${
                activeTab === t.key ? 'text-primary border-gold' : 'text-faint border-transparent'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {isTaskTab && (
          <>
            {tasksQuery.isLoading && <div className="text-sm text-faint py-8">Loading tasks…</div>}

            {tasksQuery.data && activeTab !== 'all' && (
              tasksQuery.data.length > 0
                ? <KanbanBoard tasks={tasksQuery.data} onOpen={(t) => setSelectedTaskId(t.id)} onMove={handleMove} pendingTaskId={pendingTaskId} />
                : <div className="text-[13px] text-faint py-8">Nothing on this board yet.</div>
            )}

            {tasksQuery.data && activeTab === 'all' && (
              <OrgOverview tasks={tasksQuery.data} roles={roles} roleLabelByKey={roleLabelByKey} onOpen={(t) => setSelectedTaskId(t.id)} />
            )}
          </>
        )}

        {activeTab === 'users' && <UsersManagement roles={roles} />}
        {activeTab === 'directory' && <TeamDirectory roles={roles} />}
        {activeTab === 'employees' && <EmployeeRegistry canManage={isOwner} />}
        {activeTab === 'payroll' && <Payroll />}
        {activeTab === 'kpis' && (
          <KpiTracking
            currentRoleKey={user.role.key} roleLabelByKey={roleLabelByKey}
            canManage={canAssign} isTopLevel={isTopLevel} manageableOptions={assignable}
          />
        )}
        {activeTab === 'leave' && (
          <LeaveManagement
            currentUserId={user.id} currentRoleKey={user.role.key} roleLabelByKey={roleLabelByKey}
            canManage={canAssign} isTopLevel={isTopLevel}
          />
        )}
        {activeTab === 'activity' && <ActivityLog />}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask} currentRoleKey={user.role.key} roleLabelByKey={roleLabelByKey}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
      {showNewTask && (
        <NewTaskModal options={newTaskOptions} roleLabelByKey={roleLabelByKey} onClose={() => setShowNewTask(false)} />
      )}
      {showAccount && <AccountModal userName={user.name} onClose={() => setShowAccount(false)} />}
    </div>
  );
}
