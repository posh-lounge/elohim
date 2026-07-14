'use client';

import { AlertTriangle, Calendar, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Task, TaskStatus } from '@/lib/types';
import { ROLE_ACCENT } from '@/lib/roleDisplay';
import { PriorityStamp, ProgressBar, fmtDate, isOverdue } from './primitives';

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export function TaskCard({
  task, onOpen, onMove, dragEnabled, isMoving,
}: {
  task: Task; onOpen: (t: Task) => void; onMove: (id: number, status: TaskStatus) => void;
  dragEnabled: boolean; isMoving?: boolean;
}) {
  const idx = STATUS_ORDER.indexOf(task.status);
  const lastUpdate = task.updates[task.updates.length - 1];
  const overdue = isOverdue(task.status, task.dueDate);
  const accent = ROLE_ACCENT[task.assignedToRole];

  return (
    <div
      draggable={dragEnabled && !isMoving}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
      onClick={() => onOpen(task)}
      className={`relative bg-surface-alt border border-border-soft border-l-[3px] ${accent.border} rounded-lg px-3 py-2.5 mb-2 cursor-pointer shadow-sm transition-opacity ${isMoving ? 'opacity-60' : ''}`}
    >
      {isMoving && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-gold font-mono">
          <Loader2 size={11} className="animate-spin" /> moving…
        </div>
      )}

      <div className="flex justify-between items-start gap-2">
        <div className="text-[13.5px] font-semibold leading-snug">{task.title}</div>
        {!isMoving && <PriorityStamp priority={task.priority} />}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="flex items-center gap-1.5 text-[11.5px] text-muted font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${accent.bg}`} />
        </span>
        <span className={`flex items-center gap-1 text-[11px] font-mono ${overdue ? 'text-danger' : 'text-faint'}`}>
          {overdue ? <AlertTriangle size={11} /> : <Calendar size={11} />} {fmtDate(task.dueDate)}
        </span>
      </div>

      {lastUpdate && <ProgressBar value={lastUpdate.progress} />}

      {task.updates.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-faint">
          <MessageSquare size={11} /> {task.updates.length} report{task.updates.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="flex justify-end gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
        <button
          disabled={idx <= 0 || isMoving} onClick={() => onMove(task.id, STATUS_ORDER[idx - 1])}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface-alt text-muted disabled:opacity-30"
        ><ChevronLeft size={13} /></button>
        <button
          disabled={idx >= STATUS_ORDER.length - 1 || isMoving} onClick={() => onMove(task.id, STATUS_ORDER[idx + 1])}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface-alt text-muted disabled:opacity-30"
        ><ChevronRight size={13} /></button>
      </div>
    </div>
  );
}
