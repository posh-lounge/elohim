'use client';

import { useState } from 'react';
import { X, Check, Calendar, AlertTriangle } from 'lucide-react';
import type { RoleKey, Task, TaskStatus } from '@/lib/types';
import { ROLE_ACCENT } from '@/lib/roleDisplay';
import { PriorityStamp, ProgressBar, fmtDate, isOverdue, timeAgo } from './primitives';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { useAddTaskUpdate } from '@/hooks/useAddTaskUpdate';

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export function TaskModal({
  task, currentRoleKey, currentEmployeeId, roleLabelByKey, onClose,
}: {
  task: Task; currentRoleKey: RoleKey; currentEmployeeId: number | null; roleLabelByKey: Record<string, string>; onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState(task.updates.length ? task.updates[task.updates.length - 1].progress : 25);
  const updateStatus = useUpdateTaskStatus();
  const addUpdate = useAddTaskUpdate();

  const canReport = task.assignedToEmployee
    ? task.assignedToEmployee.id === currentEmployeeId
    : task.assignedToRole === currentRoleKey; // legacy/unclaimed task fallback
  const overdue = isOverdue(task.status, task.dueDate);

  const submit = () => {
    if (!note.trim()) return;
    addUpdate.mutate({ taskId: task.id, note: note.trim(), progress }, { onSuccess: () => setNote('') });
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-xl animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-start">
          <div>
            <div className="flex gap-2 items-center mb-1.5">
              <PriorityStamp priority={task.priority} />
              <span className="text-[11.5px] text-muted font-mono">
                {task.assignedToEmployee?.name ?? 'Unassigned'} · {roleLabelByKey[task.assignedToRole]}
              </span>
            </div>
            <div className="font-display text-lg font-semibold">{task.title}</div>
            {task.responsibility && (
              <div className="text-[11.5px] text-faint italic mt-1">↳ {task.responsibility.text}</div>
            )}
          </div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="px-5 py-4">
          {task.description && <p className="text-[13px] text-muted leading-relaxed mb-3.5">{task.description}</p>}

          <div className="flex gap-5 flex-wrap mb-4 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">Assigned to</div>
              <div className="mt-1">{task.assignedToEmployee?.name ?? 'Unassigned'} <span className="text-faint">({roleLabelByKey[task.assignedToRole]})</span></div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">Assigned by</div>
              <div className="mt-1">{roleLabelByKey[task.assignedByRole]}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">Due</div>
              <div className={`mt-1 flex items-center gap-1 ${overdue ? 'text-danger' : ''}`}>
                {overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />} {fmtDate(task.dueDate)}{overdue && ' · overdue'}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-5">
            {STATUS_COLUMNS.map((c) => (
              <button
                key={c.key} disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ taskId: task.id, status: c.key })}
                className={`text-[11.5px] px-2.5 py-1.5 rounded-md font-semibold border disabled:opacity-40 ${
                  task.status === c.key ? 'border-gold bg-gold-soft text-primary' : 'border-border bg-surface-alt text-muted'
                }`}
              >{c.label}</button>
            ))}
          </div>

          <div className="font-mono text-[10.5px] uppercase tracking-wider text-gold mb-2">Reports on this task</div>
          <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto mb-3.5">
            {task.updates.length === 0 && <div className="text-xs text-faint">No reports yet.</div>}
            {[...task.updates].reverse().map((u) => (
              <div key={u.id} className="bg-surface-alt border border-border-soft rounded-lg px-3 py-2.5">
                <div className="flex justify-between mb-1">
                  <span className="text-[11.5px] font-semibold">{roleLabelByKey[u.authorRole]}</span>
                  <span className="text-[10.5px] text-faint font-mono">{timeAgo(u.ts)}</span>
                </div>
                <div className="text-xs text-muted leading-relaxed">{u.note}</div>
                <ProgressBar value={u.progress} />
                <div className="text-[10.5px] text-faint mt-1 font-mono">{u.progress}% complete</div>
              </div>
            ))}
          </div>

          {canReport ? (
            <div className="border-t border-border-soft pt-3.5">
              <div className="text-[11.5px] text-muted mb-2">Post a progress report as {roleLabelByKey[currentRoleKey]}</div>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                placeholder="What's the status? What's blocking you, if anything?"
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px] resize-y"
              />
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="text-[11px] text-faint whitespace-nowrap">Progress</span>
                <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="flex-1 accent-gold" />
                <span className="text-[11.5px] font-mono w-9">{progress}%</span>
                <button
                  onClick={submit} disabled={!note.trim() || addUpdate.isPending}
                  className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-md px-3 py-2 text-xs disabled:opacity-40 whitespace-nowrap"
                ><Check size={13} /> {addUpdate.isPending ? 'Posting…' : 'Post report'}</button>
              </div>
              {addUpdate.isError && <div className="text-[11px] text-danger mt-2">{(addUpdate.error as Error).message}</div>}
            </div>
          ) : (
            <div className="text-[11.5px] text-faint border-t border-border-soft pt-3">
              Only {task.assignedToEmployee?.name ?? roleLabelByKey[task.assignedToRole]} can post progress reports on this task.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
