'use client';

import { useState } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export function KanbanBoard({
  tasks, onOpen, onMove, pendingTaskId,
}: {
  tasks: Task[]; onOpen: (t: Task) => void; onMove: (id: number, status: TaskStatus) => void; pendingTaskId?: number | null;
}) {
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-2">
      {STATUS_COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => {
              e.preventDefault();
              const id = Number(e.dataTransfer.getData('text/plain'));
              if (id) onMove(id, col.key);
              setDragOverCol(null);
            }}
            className={`min-w-[260px] w-[260px] shrink-0 rounded-xl p-2 border transition-colors ${
              dragOverCol === col.key ? 'bg-elevated border-dashed border-gold' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between px-1 pb-2.5 mb-2.5 border-b border-border-soft">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-semibold">{col.label}</span>
              <span className="text-[11px] text-faint font-mono">{items.length}</span>
            </div>

            {items.length === 0 && (
              <div className="text-xs text-faint text-center py-4 border border-dashed border-border-soft rounded-lg">Nothing here</div>
            )}

            {items.map((t) => (
              <TaskCard key={t.id} task={t} onOpen={onOpen} onMove={onMove} dragEnabled isMoving={pendingTaskId === t.id} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
