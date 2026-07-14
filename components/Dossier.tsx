'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { Role, RoleContentItem, RoleKey } from '@/lib/types';
import { ASSIGNABLE_ROLES } from '@/lib/types';
import { ROLE_ICON, ROLE_ACCENT } from '@/lib/roleDisplay';
import { useAddRoleItem, useUpdateRoleItem, useDeleteRoleItem } from '@/hooks/useRoleContent';

function EditableList({
  roleKey, kind, items, canEdit, accentText,
}: {
  roleKey: RoleKey; kind: 'responsibilities' | 'kpi-criteria'; items: RoleContentItem[]; canEdit: boolean; accentText: string;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const addItem = useAddRoleItem();
  const updateItem = useUpdateRoleItem();
  const deleteItem = useDeleteRoleItem();

  const startEdit = (item: RoleContentItem) => { setEditingId(item.id); setDraft(item.text); };
  const saveEdit = (id: number) => {
    if (!draft.trim()) return;
    updateItem.mutate({ roleKey, kind, id, text: draft.trim() }, { onSuccess: () => setEditingId(null) });
  };
  const submitNew = () => {
    if (!newText.trim()) return;
    addItem.mutate({ roleKey, kind, text: newText.trim() }, { onSuccess: () => { setNewText(''); setAdding(false); } });
  };

  return (
    <ul className="text-[12.5px] text-muted leading-relaxed space-y-1 list-none pl-0">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-1.5 group">
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
              <span className="flex-1">{item.text}</span>
              {canEdit && (
                <span className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-faint hover:text-primary"><Pencil size={11} /></button>
                  <button
                    onClick={() => deleteItem.mutate({ roleKey, kind, id: item.id })}
                    className="text-faint hover:text-danger"
                  ><Trash2 size={11} /></button>
                </span>
              )}
            </>
          )}
        </li>
      ))}

      {canEdit && (
        adding ? (
          <li className="flex items-center gap-1.5 pt-1">
            <input
              value={newText} onChange={(e) => setNewText(e.target.value)} autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              placeholder="New item…"
              className="flex-1 bg-surface-alt border border-border rounded px-2 py-1 text-[12px]"
            />
            <button onClick={submitNew} className="text-success shrink-0"><Check size={13} /></button>
            <button onClick={() => { setAdding(false); setNewText(''); }} className="text-faint shrink-0"><X size={13} /></button>
          </li>
        ) : (
          <li className="pt-1">
            <button onClick={() => setAdding(true)} className={`flex items-center gap-1 text-[11px] ${accentText}`}>
              <Plus size={11} /> Add
            </button>
          </li>
        )
      )}
    </ul>
  );
}

export function Dossier({ role, roleLabelByKey, currentRoleKey }: {
  role: Role; roleLabelByKey: Record<string, string>; currentRoleKey: RoleKey;
}) {
  const [open, setOpen] = useState(true);
  const Icon = ROLE_ICON[role.key];
  const accent = ROLE_ACCENT[role.key];
  const canEdit = currentRoleKey === role.key || (ASSIGNABLE_ROLES[currentRoleKey] ?? []).includes(role.key);

  return (
    <div className="bg-surface border border-border rounded-xl mb-4 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent.softBg}`}>
            <Icon size={17} className={accent.text} />
          </div>
          <div>
            <div className="font-display text-base font-semibold">{role.label}</div>
            <div className="font-mono text-[11px] text-faint">
              {role.reportsTo ? `reports to ${roleLabelByKey[role.reportsTo]}` : 'top of the chain'} · {role.department}
            </div>
          </div>
        </div>
        <ChevronDown size={16} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted leading-relaxed">{role.purpose}</p>
            <div className={`font-mono text-[10.5px] uppercase tracking-wider mt-3 mb-1.5 ${accent.text}`}>Key responsibilities</div>
            <EditableList roleKey={role.key} kind="responsibilities" items={role.responsibilities} canEdit={canEdit} accentText={accent.text} />
          </div>
          <div>
            <div className={`font-mono text-[10.5px] uppercase tracking-wider mb-1.5 ${accent.text}`}>How performance is measured</div>
            <EditableList roleKey={role.key} kind="kpi-criteria" items={role.kpis} canEdit={canEdit} accentText={accent.text} />
          </div>
        </div>
      )}
    </div>
  );
}
