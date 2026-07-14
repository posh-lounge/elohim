'use client';

import { ArrowUpRight } from 'lucide-react';
import type { Role, Task } from '@/lib/types';
import { ROLE_ACCENT } from '@/lib/roleDisplay';
import { timeAgo } from './primitives';

export function OrgOverview({ tasks, roles, roleLabelByKey, onOpen }: {
  tasks: Task[]; roles: Role[]; roleLabelByKey: Record<string, string>; onOpen: (t: Task) => void;
}) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10)).length;
  const inFlight = tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;

  const allUpdates = tasks
    .flatMap((t) => t.updates.map((u) => ({ ...u, taskTitle: t.title, taskId: t.id })))
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 8);

  const Stat = ({ label, value, className }: { label: string; value: number; className?: string }) => (
    <div className="bg-surface border border-border rounded-xl px-4 py-3.5 flex-1 min-w-[120px]">
      <div className={`font-display text-2xl font-bold ${className ?? ''}`}>{value}</div>
      <div className="font-mono text-[11px] text-faint uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-3 flex-wrap mb-5">
        <Stat label="Total tasks" value={total} />
        <Stat label="In flight" value={inFlight} className="text-gold" />
        <Stat label="Done" value={done} className="text-success" />
        <Stat label="Overdue" value={overdue} className={overdue > 0 ? 'text-danger' : ''} />
      </div>

      <div className="font-mono text-[10.5px] uppercase tracking-wider text-gold mb-2.5">Load by role</div>
      <div className="flex flex-col gap-2 mb-6">
        {roles.map((r) => {
          const roleTasks = tasks.filter((t) => t.assignedToRole === r.key);
          const roleDone = roleTasks.filter((t) => t.status === 'done').length;
          const pct = roleTasks.length ? Math.round((roleDone / roleTasks.length) * 100) : 0;
          const accent = ROLE_ACCENT[r.key];
          return (
            <div key={r.key} className="flex items-center gap-2.5 text-[12.5px]">
              <div className="w-48 text-muted shrink-0">{r.label}</div>
              <div className="flex-1 h-1.5 bg-border-soft rounded-full overflow-hidden">
                <div className={`h-full ${accent.bg}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="w-24 text-right text-faint text-[11px] font-mono">{roleDone}/{roleTasks.length} done</div>
            </div>
          );
        })}
      </div>

      <div className="font-mono text-[10.5px] uppercase tracking-wider text-gold mb-2.5">Recent reports, org-wide</div>
      <div className="flex flex-col gap-2">
        {allUpdates.length === 0 && <div className="text-xs text-faint">No reports posted yet.</div>}
        {allUpdates.map((u) => (
          <button
            key={u.id} onClick={() => onOpen(tasks.find((t) => t.id === u.taskId)!)}
            className="text-left bg-surface border border-border-soft rounded-lg px-3 py-2.5"
          >
            <div className="flex justify-between mb-1">
              <span className="text-[11.5px] font-semibold">{roleLabelByKey[u.authorRole]}</span>
              <span className="text-[10.5px] text-faint font-mono">{timeAgo(u.ts)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11.5px] text-faint mb-0.5"><ArrowUpRight size={11} /> {u.taskTitle}</div>
            <div className="text-xs text-muted leading-relaxed">{u.note}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
