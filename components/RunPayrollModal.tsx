'use client';

import { useState } from 'react';
import { X, Play, Check } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { useRunPayroll } from '@/hooks/usePayroll';

export function RunPayrollModal({ employees, defaultPeriod, onClose }: {
  employees: Employee[]; defaultPeriod: string; onClose: () => void;
}) {
  const [period, setPeriod] = useState(defaultPeriod);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [gross, setGross] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    employees.forEach(emp => {
      if (emp.baseSalary && emp.baseSalary > 0) {
        initial[emp.id] = String(emp.baseSalary);
      }
    });
    return initial;
  });
  const [bonus, setBonus] = useState<Record<number, string>>({});
  const [loan, setLoan] = useState<Record<number, string>>({});
  const [advance, setAdvance] = useState<Record<number, string>>({});

  const runPayroll = useRunPayroll();

  const toggle = (id: number) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectedIds = Object.keys(selected).filter((id) => selected[Number(id)]).map(Number);

  const ready = selectedIds.length > 0 && selectedIds.every((id) => Number(gross[id]) > 0);

  const submit = () => {
    if (!ready) return;
    runPayroll.mutate(
      {
        period,
        entries: selectedIds.map((id) => ({
          employeeId: id,
          grossSalary: Number(gross[id]),
          bonus: Number(bonus[id]) || 0,
          loan: Number(loan[id]) || 0,
          advance: Number(advance[id]) || 0,
        })),
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-2xl animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div>
            <div className="font-display text-lg font-semibold">Run payroll</div>
            <div className="text-[11px] text-faint mt-0.5">Enter gross salary and any adjustments (bonus, loan, advance).</div>
          </div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block">Period</label>
            <input
              type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
              className="bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px]"
            />
          </div>

          <div className="border border-border rounded-lg divide-y divide-border-soft max-h-96 overflow-y-auto">
            {employees.map((e) => {
              const isSelected = !!selected[e.id];
              return (
                <div key={e.id} className={`flex flex-col px-3 py-2.5 ${isSelected ? 'bg-gold-soft' : ''}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggle(e.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${isSelected ? 'bg-gold border-gold' : 'border-border'}`}
                    >{isSelected && <Check size={12} className="text-[#1A1408]" />}</button>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold truncate">{e.name}</div>
                      <div className="text-[10.5px] text-faint capitalize">{e.position} · {e.employmentType}</div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number" step="any" placeholder="Gross"
                          value={gross[e.id] ?? ''} onChange={(ev) => setGross((g) => ({ ...g, [e.id]: ev.target.value }))}
                          className="w-24 bg-surface-alt border border-border rounded-md px-2 py-1.5 text-[12px]"
                        />
                        <input
                          type="number" step="any" placeholder="Bonus"
                          value={bonus[e.id] ?? ''} onChange={(ev) => setBonus((g) => ({ ...g, [e.id]: ev.target.value }))}
                          className="w-20 bg-surface-alt border border-border rounded-md px-2 py-1.5 text-[12px]"
                        />
                        <input
                          type="number" step="any" placeholder="Loan"
                          value={loan[e.id] ?? ''} onChange={(ev) => setLoan((g) => ({ ...g, [e.id]: ev.target.value }))}
                          className="w-20 bg-surface-alt border border-border rounded-md px-2 py-1.5 text-[12px]"
                        />
                        <input
                          type="number" step="any" placeholder="Advance"
                          value={advance[e.id] ?? ''} onChange={(ev) => setAdvance((g) => ({ ...g, [e.id]: ev.target.value }))}
                          className="w-20 bg-surface-alt border border-border rounded-md px-2 py-1.5 text-[12px]"
                        />
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="text-[10px] text-faint mt-1 ml-8 flex gap-3">
                      <span>Gross (base)</span>
                      <span>Bonus (+)</span>
                      <span>Loan (–)</span>
                      <span>Advance (–)</span>
                    </div>
                  )}
                </div>
              );
            })}
            {employees.length === 0 && <div className="px-3 py-4 text-[12px] text-faint text-center">No active employees.</div>}
          </div>

          {selectedIds.length > 0 && !ready && (
            <div className="text-[11px] text-gold">Enter a gross salary for everyone selected.</div>
          )}
          {runPayroll.isError && <div className="text-[11px] text-danger">{(runPayroll.error as Error).message}</div>}

          <button
            onClick={submit} disabled={!ready || runPayroll.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          >
            <Play size={14} /> {runPayroll.isPending ? 'Running…' : `Run payroll for ${selectedIds.length || ''} ${selectedIds.length === 1 ? 'person' : 'people'}`}
          </button>
          <div className="text-[10.5px] text-faint text-center">
            Re-running for someone already paid this period replaces their figures — it doesn't duplicate them.
          </div>
        </div>
      </div>
    </div>
  );
}