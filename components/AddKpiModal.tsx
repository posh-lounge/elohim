'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { RoleKey } from '@/lib/types';
import { useCreateKpiDefinition } from '@/hooks/useKpis';

export function AddKpiModal({ options, roleLabelByKey, onClose }: {
  options: RoleKey[]; roleLabelByKey: Record<string, string>; onClose: () => void;
}) {
  const [roleKey, setRoleKey] = useState<RoleKey>(options[0]);
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const createDef = useCreateKpiDefinition();

  const submit = () => {
    if (!label.trim()) return;
    createDef.mutate(
      {
        roleKey, label: label.trim(), unit: unit.trim() || undefined,
        targetValue: targetValue.trim() ? Number(targetValue) : undefined,
      },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label_ = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Track a new metric</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className={label_}>For role</label>
            <select value={roleKey} onChange={(e) => setRoleKey(e.target.value as RoleKey)} className={field}>
              {options.map((rid) => <option key={rid} value={rid}>{roleLabelByKey[rid]}</option>)}
            </select>
          </div>
          <div>
            <label className={label_}>Metric name</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Average table turnaround time" className={field} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label_}>Unit (optional)</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="%, RWF, days…" className={field} />
            </div>
            <div className="flex-1">
              <label className={label_}>Target (optional)</label>
              <input type="number" step="any" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className={field} />
            </div>
          </div>
          {createDef.isError && <div className="text-[11px] text-danger">{(createDef.error as Error).message}</div>}
          <button
            onClick={submit} disabled={!label.trim() || createDef.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><Plus size={15} /> {createDef.isPending ? 'Adding…' : 'Start tracking'}</button>
        </div>
      </div>
    </div>
  );
}
