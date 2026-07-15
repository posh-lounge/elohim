'use client';

import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import type { Priority, Role, RoleKey } from '@/lib/types';
import { useCreateTask } from '@/hooks/useCreateTask';

export function NewTaskModal({
  options, roles, roleLabelByKey, onClose,
}: {
  options: RoleKey[]; roles: Role[]; roleLabelByKey: Record<string, string>; onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToRole, setAssignedToRole] = useState<RoleKey>(options[0]);
  const [responsibilityId, setResponsibilityId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const createTask = useCreateTask();

  const targetRole = roles.find((r) => r.key === assignedToRole);
  const responsibilities = useMemo(() => targetRole?.responsibilities ?? [], [targetRole]);

  const changeRole = (rid: RoleKey) => {
    setAssignedToRole(rid);
    setResponsibilityId(null); // the previous role's responsibility no longer applies
  };

  const submit = () => {
    if (!title.trim() || !responsibilityId) return;
    createTask.mutate(
      { title: title.trim(), description: description.trim(), assignedToRole, responsibilityId, priority, dueDate: dueDate || null },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Assign a new task</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className={label}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reconcile weekend till reports" className={field} />
          </div>
          <div>
            <label className={label}>Details (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${field} resize-y`} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Assign to</label>
              <select value={assignedToRole} onChange={(e) => changeRole(e.target.value as RoleKey)} className={field}>
                {options.map((rid) => <option key={rid} value={rid}>{roleLabelByKey[rid]}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className={label}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Which responsibility is this for?</label>
            <select
              value={responsibilityId ?? ''} onChange={(e) => setResponsibilityId(e.target.value ? Number(e.target.value) : null)}
              className={field}
            >
              <option value="" disabled>Select one…</option>
              {responsibilities.map((r) => <option key={r.id} value={r.id}>{r.text}</option>)}
            </select>
            {responsibilities.length === 0 && (
              <div className="text-[10.5px] text-danger mt-1">
                {roleLabelByKey[assignedToRole]} has no listed responsibilities yet — ask the Owner to add one first.
              </div>
            )}
          </div>
          <div>
            <label className={label}>Due date (optional)</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
          </div>

          {createTask.isError && <div className="text-[11px] text-danger">{(createTask.error as Error).message}</div>}

          <button
            onClick={submit} disabled={!title.trim() || !responsibilityId || createTask.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><Plus size={15} /> {createTask.isPending ? 'Creating…' : 'Create & assign'}</button>
        </div>
      </div>
    </div>
  );
}
