'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Employee, PayrollCategory } from '@/lib/types';
import { PAYROLL_CATEGORY_LABEL, MANUAL_PAYROLL_CATEGORIES } from '@/lib/types';
import { useCreatePayrollEntry } from '@/hooks/usePayroll';

export function AddPayrollEntryModal({ employees, defaultPeriod, onClose }: {
  employees: Employee[]; defaultPeriod: string; onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState<number>(employees[0]?.id ?? 0);
  const [period, setPeriod] = useState(defaultPeriod);
  const [category, setCategory] = useState<PayrollCategory>('bonus');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'earning' | 'deduction'>('earning');
  const [note, setNote] = useState('');
  const createEntry = useCreatePayrollEntry();

  const submit = () => {
    const numeric = Number(amount);
    if (!employeeId || !period || Number.isNaN(numeric) || numeric <= 0) return;
    createEntry.mutate(
      {
        employeeId, period, category, amount: numeric, note: note.trim() || undefined,
        ...(category === 'other' ? { direction } : {}),
      },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Add a one-off entry</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div className="text-[11px] text-faint bg-surface-alt border border-border-soft rounded-lg px-3 py-2">
            For bonuses, loans, advances, or anything else one-off. Base salary and RSSB figures are
            calculated together in <strong className="text-muted">Run payroll</strong>, not added here.
          </div>
          <div>
            <label className={label}>Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(Number(e.target.value))} className={field}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name} — {e.position} ({e.employmentType})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Period</label>
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as PayrollCategory)} className={field}>
                {MANUAL_PAYROLL_CATEGORIES.map((c) => <option key={c} value={c}>{PAYROLL_CATEGORY_LABEL[c]}</option>)}
              </select>
            </div>
          </div>
          {category === 'other' && (
            <div>
              <label className={label}>This entry is a…</label>
              <div className="flex gap-2">
                <button onClick={() => setDirection('earning')} className={`flex-1 text-[12px] py-2 rounded-lg border ${direction === 'earning' ? 'border-success bg-success/10 text-success' : 'border-border text-muted'}`}>Earning</button>
                <button onClick={() => setDirection('deduction')} className={`flex-1 text-[12px] py-2 rounded-lg border ${direction === 'deduction' ? 'border-danger bg-danger/10 text-danger' : 'border-border text-muted'}`}>Deduction</button>
              </div>
            </div>
          )}
          <div>
            <label className={label}>Amount (RWF)</label>
            <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label}>Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${field} resize-y`} />
          </div>

          {createEntry.isError && <div className="text-[11px] text-danger">{(createEntry.error as Error).message}</div>}

          <button
            onClick={submit} disabled={!employeeId || !amount || Number(amount) <= 0 || createEntry.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><Plus size={15} /> {createEntry.isPending ? 'Adding…' : 'Add entry'}</button>
        </div>
      </div>
    </div>
  );
}
