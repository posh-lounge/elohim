'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Priority, RoleKey } from '@/lib/types';
import { useCreateTask } from '@/hooks/useCreateTask';
import { useEmployeesByRole } from '@/hooks/useEmployees';
import { useEmployeeResponsibilities, useCopyRoleResponsibilities } from '@/hooks/useEmployeeResponsibilities';

export function NewTaskModal({
  options, roleLabelByKey, onClose,
}: {
  options: RoleKey[]; roleLabelByKey: Record<string, string>; onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToRole, setAssignedToRole] = useState<RoleKey>(options[0]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [responsibilityId, setResponsibilityId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const createTask = useCreateTask();
  const copyFromRole = useCopyRoleResponsibilities();

  const employeesQuery = useEmployeesByRole(assignedToRole);
  const responsibilitiesQuery = useEmployeeResponsibilities(employeeId);

  const changeRole = (rid: RoleKey) => {
    setAssignedToRole(rid);
    setEmployeeId(null);
    setResponsibilityId(null);
  };

  // Auto-pick the employee if there's only one in the role — the common
  // case — but leave it for the user to choose when there's more than one.
  useEffect(() => {
    if (employeesQuery.data && employeesQuery.data.length === 1 && employeeId === null) {
      setEmployeeId(employeesQuery.data[0].id);
    }
  }, [employeesQuery.data, employeeId]);

  useEffect(() => setResponsibilityId(null), [employeeId]);

  const submit = () => {
    if (!title.trim() || !employeeId || !responsibilityId) return;
    createTask.mutate(
      { title: title.trim(), description: description.trim(), assignedToRole, employeeId, responsibilityId, priority, dueDate: dueDate || null },
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

          <div>
            <label className={label}>Role</label>
            <select value={assignedToRole} onChange={(e) => changeRole(e.target.value as RoleKey)} className={field}>
              {options.map((rid) => <option key={rid} value={rid}>{roleLabelByKey[rid]}</option>)}
            </select>
          </div>

          <div>
            <label className={label}>Assign to</label>
            {employeesQuery.isLoading && <div className="text-[11.5px] text-faint">Loading people…</div>}
            {employeesQuery.data && employeesQuery.data.length === 0 && (
              <div className="text-[11.5px] text-danger">
                Nobody is currently in this role. Add them from the Users tab first.
              </div>
            )}
            {employeesQuery.data && employeesQuery.data.length > 0 && (
              <select value={employeeId ?? ''} onChange={(e) => setEmployeeId(Number(e.target.value))} className={field}>
                <option value="" disabled>Select a person…</option>
                {employeesQuery.data.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            )}
          </div>

          {employeeId !== null && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${label} mb-0`}>Which responsibility is this for?</label>
                {responsibilitiesQuery.data && responsibilitiesQuery.data.length === 0 && (
                  <button
                    onClick={() => copyFromRole.mutate(employeeId)} disabled={copyFromRole.isPending}
                    className="text-[10.5px] text-gold flex items-center gap-1 disabled:opacity-50"
                  >{copyFromRole.isPending ? <Loader2 size={10} className="animate-spin" /> : null} Copy from role template</button>
                )}
              </div>
              {responsibilitiesQuery.isLoading && <div className="text-[11.5px] text-faint">Loading…</div>}
              {responsibilitiesQuery.data && responsibilitiesQuery.data.length === 0 && !copyFromRole.isPending && (
                <div className="text-[10.5px] text-faint bg-surface-alt border border-border-soft rounded-lg px-3 py-2">
                  This person has no responsibilities listed yet — use "copy from role template" above, or add one from the{' '}
                  <Link href="/" className="text-gold underline">Employees tab</Link>.
                </div>
              )}
              {responsibilitiesQuery.data && responsibilitiesQuery.data.length > 0 && (
                <select
                  value={responsibilityId ?? ''} onChange={(e) => setResponsibilityId(e.target.value ? Number(e.target.value) : null)}
                  className={field}
                >
                  <option value="" disabled>Select one…</option>
                  {responsibilitiesQuery.data.map((r) => <option key={r.id} value={r.id}>{r.text}</option>)}
                </select>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={label}>Due date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
            </div>
          </div>

          {createTask.isError && <div className="text-[11px] text-danger">{(createTask.error as Error).message}</div>}

          <button
            onClick={submit} disabled={!title.trim() || !employeeId || !responsibilityId || createTask.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><Plus size={15} /> {createTask.isPending ? 'Creating…' : 'Create & assign'}</button>
        </div>
      </div>
    </div>
  );
}
