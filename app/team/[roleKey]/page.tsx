'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { RoleKey, TaskStatus } from '@/lib/types';
import { ASSIGNABLE_ROLES } from '@/lib/types';
import { useSession } from '@/hooks/useSession';
import { useRoles } from '@/hooks/useRoles';
import { useRoleTasks } from '@/hooks/useTasks';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { Dossier } from '@/components/Dossier';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskModal } from '@/components/TaskModal';
import { ROLE_ICON, ROLE_ACCENT } from '@/lib/roleDisplay';

export default function TeamMemberPage() {
  const params = useParams<{ roleKey: string }>();
  const targetRoleKey = params.roleKey as RoleKey;
  const router = useRouter();

  const session = useSession();
  const rolesQuery = useRoles();
  const tasksQuery = useRoleTasks(targetRoleKey);
  const updateStatus = useUpdateTaskStatus();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  if (session.isLoading || rolesQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading…
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
  const targetRole = roles.find((r) => r.key === targetRoleKey);

  const isTopLevel = user.role.key === 'owner' || user.role.key === 'ops_manager';
  const isSelf = user.role.key === targetRoleKey;
  const manages = (ASSIGNABLE_ROLES[user.role.key] ?? []).includes(targetRoleKey);
  const canView = isTopLevel || isSelf || manages;

  const selectedTask = selectedTaskId ? tasksQuery.data?.find((t) => t.id === selectedTaskId) ?? null : null;
  const handleMove = (taskId: number, status: TaskStatus) => updateStatus.mutate({ taskId, status });
  const pendingTaskId = updateStatus.isPending ? updateStatus.variables?.taskId ?? null : null;

  if (!targetRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted">
        <div>That role doesn't exist.</div>
        <Link href="/" className="text-gold text-sm">← Back to dashboard</Link>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted px-4 text-center">
        <div>You don't have visibility into {targetRole.label}'s tasks.</div>
        <Link href="/" className="text-gold text-sm">← Back to dashboard</Link>
      </div>
    );
  }

  const Icon = ROLE_ICON[targetRoleKey];
  const accent = ROLE_ACCENT[targetRoleKey];

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-20 bg-[rgba(18,21,27,0.94)] backdrop-blur border-b border-border">
        <div className="max-w-[1320px] mx-auto px-4.5 py-3.5">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-faint hover:text-primary w-fit">
            <ArrowLeft size={13} /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2.5 mt-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent.softBg}`}>
              <Icon size={18} className={accent.text} />
            </div>
            <div>
              <div className="font-display text-xl font-bold">{targetRole.label}</div>
              <div className="font-mono text-[10.5px] text-faint tracking-widest">TASK BOARD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4.5 pt-4.5 pb-16">
        <Dossier role={targetRole} roleLabelByKey={roleLabelByKey} currentRoleKey={user.role.key} />

        {tasksQuery.isLoading && <div className="text-sm text-faint py-8">Loading tasks…</div>}
        {tasksQuery.data && tasksQuery.data.length === 0 && (
          <div className="text-[13px] text-faint py-8">Nothing on {targetRole.label}'s board right now.</div>
        )}
        {tasksQuery.data && tasksQuery.data.length > 0 && (
          <KanbanBoard tasks={tasksQuery.data} onOpen={(t) => setSelectedTaskId(t.id)} onMove={handleMove} pendingTaskId={pendingTaskId} />
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask} currentRoleKey={user.role.key} roleLabelByKey={roleLabelByKey}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
