'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

const INITIAL_VISIBLE = 8;
const REVEAL_STEP = 8;

function Column({
  colKey, label, items, onOpen, onMove, pendingTaskId, dragOverCol, setDragOverCol,
}: {
  colKey: TaskStatus; label: string; items: Task[]; onOpen: (t: Task) => void;
  onMove: (id: number, status: TaskStatus) => void; pendingTaskId?: number | null;
  dragOverCol: TaskStatus | null; setDragOverCol: (c: TaskStatus | null) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visible.length;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOverCol(colKey); }}
      onDragLeave={() => setDragOverCol(null)}
      onDrop={(e) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('text/plain'));
        if (id) onMove(id, colKey);
        setDragOverCol(null);
      }}
      className={`min-w-[260px] w-[260px] shrink-0 rounded-xl p-2 border transition-colors ${
        dragOverCol === colKey ? 'bg-elevated border-dashed border-gold' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-1 pb-2.5 mb-2.5 border-b border-border-soft">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-semibold">{label}</span>
        <span className="text-[11px] text-faint font-mono">{items.length}</span>
      </div>

      {items.length === 0 && (
        <div className="text-xs text-faint text-center py-4 border border-dashed border-border-soft rounded-lg">Nothing here</div>
      )}

      {visible.map((t) => (
        <TaskCard key={t.id} task={t} onOpen={onOpen} onMove={onMove} dragEnabled isMoving={pendingTaskId === t.id} />
      ))}

      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((c) => c + REVEAL_STEP)}
          className="w-full flex items-center justify-center gap-1.5 mt-1 py-2 rounded-lg border border-dashed border-border text-faint text-[11px]"
        ><ChevronDown size={12} /> View {Math.min(remaining, REVEAL_STEP)} more ({remaining} left)</button>
      )}
    </div>
  );
}

export function KanbanBoard({
  tasks, onOpen, onMove, pendingTaskId,
}: {
  tasks: Task[]; onOpen: (t: Task) => void; onMove: (id: number, status: TaskStatus) => void; pendingTaskId?: number | null;
}) {
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-2">
      {STATUS_COLUMNS.map((col) => (
        <Column
          key={col.key} colKey={col.key} label={col.label}
          items={tasks.filter((t) => t.status === col.key)}
          onOpen={onOpen} onMove={onMove} pendingTaskId={pendingTaskId}
          dragOverCol={dragOverCol} setDragOverCol={setDragOverCol}
        />
      ))}
    </div>
  );
}
