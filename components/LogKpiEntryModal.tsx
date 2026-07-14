'use client';

import { useState } from 'react';
import { X, LineChart } from 'lucide-react';
import type { KpiDefinition } from '@/lib/types';
import { useAddKpiEntry } from '@/hooks/useKpis';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function LogKpiEntryModal({ definition, onClose }: { definition: KpiDefinition; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [periodDate, setPeriodDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const addEntry = useAddKpiEntry();

  const submit = () => {
    const numeric = Number(value);
    if (!value.trim() || Number.isNaN(numeric)) return;
    addEntry.mutate(
      { definitionId: definition.id, value: numeric, periodDate, note: note.trim() || undefined },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-sm animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-base font-semibold">{definition.label}</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className={label}>Value {definition.unit && `(${definition.unit})`}</label>
            <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className={field} autoFocus />
          </div>
          <div>
            <label className={label}>Period</label>
            <input type="date" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label}>Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${field} resize-y`} />
          </div>
          {addEntry.isError && <div className="text-[11px] text-danger">{(addEntry.error as Error).message}</div>}
          <button
            onClick={submit} disabled={!value.trim() || addEntry.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><LineChart size={14} /> {addEntry.isPending ? 'Saving…' : 'Log reading'}</button>
        </div>
      </div>
    </div>
  );
}
