'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Task } from '@/lib/types';
import { useUpdateTask } from '@/hooks/useUpdateTask';

export function EditTaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [priority, setPriority] = useState(task.priority);
  const updateTask = useUpdateTask();

  const submit = () => {
    if (!title.trim()) return;
    updateTask.mutate(
      {
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md p-5 animate-fade-in">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-lg font-semibold">Edit task</h3>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px]"
            placeholder="Task title"
          />
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px] resize-y"
            placeholder="Description (optional)"
          />
          <input
            type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px]"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px]">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {updateTask.isError && <div className="text-xs text-danger">{(updateTask.error as Error).message}</div>}
          <button
            onClick={submit} disabled={!title.trim() || updateTask.isPending}
            className="w-full flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          >
            <Check size={15} /> {updateTask.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}