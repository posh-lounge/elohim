'use client';

import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check, Copy, Loader2 } from 'lucide-react';
import type { Employee, RoleContentItem } from '@/lib/types';
import {
  useEmployeeResponsibilities, useAddEmployeeResponsibility,
  useUpdateEmployeeResponsibility, useDeleteEmployeeResponsibility, useCopyRoleResponsibilities,
} from '@/hooks/useEmployeeResponsibilities';

export function EmployeeResponsibilitiesModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const responsibilitiesQuery = useEmployeeResponsibilities(employee.id);
  const addItem = useAddEmployeeResponsibility();
  const updateItem = useUpdateEmployeeResponsibility();
  const deleteItem = useDeleteEmployeeResponsibility();
  const copyFromRole = useCopyRoleResponsibilities();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const startEdit = (item: RoleContentItem) => { setEditingId(item.id); setDraft(item.text); };
  const saveEdit = (id: number) => {
    if (!draft.trim()) return;
    updateItem.mutate({ employeeId: employee.id, id, text: draft.trim() }, { onSuccess: () => setEditingId(null) });
  };
  const submitNew = () => {
    if (!newText.trim()) return;
    addItem.mutate({ employeeId: employee.id, text: newText.trim() }, { onSuccess: () => { setNewText(''); setAdding(false); } });
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div>
            <div className="font-display text-base font-semibold">{employee.name}'s responsibilities</div>
            <div className="text-[10.5px] text-faint mt-0.5">{employee.position}</div>
          </div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="p-5">
          {employee.roleKey && (
            <button
              onClick={() => copyFromRole.mutate(employee.id)} disabled={copyFromRole.isPending}
              className="flex items-center gap-1.5 text-[11.5px] text-gold border border-gold rounded-lg px-2.5 py-1.5 mb-3.5 disabled:opacity-50"
            >{copyFromRole.isPending ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />} Copy from role template</button>
          )}

          {responsibilitiesQuery.isLoading && <div className="text-xs text-faint">Loading…</div>}
          {responsibilitiesQuery.data && responsibilitiesQuery.data.length === 0 && (
            <div className="text-xs text-faint mb-2">No responsibilities yet — copy from the role template above, or add one below.</div>
          )}

          <ul className="flex flex-col gap-1.5 mb-3">
            {responsibilitiesQuery.data?.map((item) => (
              <li key={item.id} className="flex items-start gap-1.5 group text-[12.5px]">
                <span className="text-faint mt-[3px]">•</span>
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(item.id)}
                      className="flex-1 bg-surface-alt border border-border rounded px-2 py-1 text-[12px]"
                    />
                    <button onClick={() => saveEdit(item.id)} className="text-success shrink-0"><Check size={13} /></button>
                    <button onClick={() => setEditingId(null)} className="text-faint shrink-0"><X size={13} /></button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-muted">{item.text}</span>
                    <span className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(item)} className="text-faint hover:text-primary"><Pencil size={11} /></button>
                      <button
                        onClick={() => deleteItem.mutate({ employeeId: employee.id, id: item.id })}
                        className="text-faint hover:text-danger"
                      ><Trash2 size={11} /></button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>

          {adding ? (
            <div className="flex items-center gap-1.5">
              <input
                value={newText} onChange={(e) => setNewText(e.target.value)} autoFocus
                onKeyDown={(e) => e.key === 'Enter' && submitNew()}
                placeholder="New responsibility…"
                className="flex-1 bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12px]"
              />
              <button onClick={submitNew} className="text-success shrink-0"><Check size={16} /></button>
              <button onClick={() => { setAdding(false); setNewText(''); }} className="text-faint shrink-0"><X size={16} /></button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-[12px] text-gold">
              <Plus size={13} /> Add responsibility
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
