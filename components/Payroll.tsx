'use client';

import { useState } from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';
import type { PayrollEntry } from '@/lib/types';
import { PAYROLL_CATEGORY_LABEL } from '@/lib/types';
import { useAllEmployeesForPicker } from '@/hooks/useEmployees';
import { usePayroll, useDeletePayrollEntry } from '@/hooks/usePayroll';
import { RunPayrollModal } from './RunPayrollModal';
import { AddPayrollEntryModal } from './AddPayrollEntryModal';

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtRWF(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' RWF';
}

function EmployeePayrollCard({ employeeName, entries, onDelete }: {
  employeeName: string; entries: PayrollEntry[]; onDelete: (id: number) => void;
}) {
  const earnings = entries.filter((e) => e.direction === 'earning').reduce((sum, e) => sum + e.amount, 0);
  const deductions = entries.filter((e) => e.direction === 'deduction').reduce((sum, e) => sum + e.amount, 0);
  const employerCosts = entries.filter((e) => e.direction === 'employer_cost').reduce((sum, e) => sum + e.amount, 0);
  const net = earnings - deductions;

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-[13.5px] font-semibold">{employeeName}</div>
        <div className="text-right">
          <div className="text-lg font-display font-bold text-gold">{fmtRWF(net)}</div>
          <div className="text-[10px] text-faint font-mono">net to employee</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        {entries.filter((e) => e.direction !== 'employer_cost').map((e) => (
          <div key={e.id} className="flex items-center justify-between text-[12px] group">
            <span className="text-muted">{PAYROLL_CATEGORY_LABEL[e.category]}{e.note ? ` — ${e.note}` : ''}</span>
            <span className="flex items-center gap-2">
              <span className={e.direction === 'earning' ? 'text-success' : 'text-danger'}>
                {e.direction === 'earning' ? '+' : '−'}{fmtRWF(e.amount)}
              </span>
              <button onClick={() => onDelete(e.id)} className="text-faint hover:text-danger opacity-0 group-hover:opacity-100">
                <Trash2 size={12} />
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[11px] text-faint border-t border-border-soft pt-2 font-mono mb-2">
        <span>Earnings: {fmtRWF(earnings)}</span>
        <span>Deductions: {fmtRWF(deductions)}</span>
      </div>

      {employerCosts > 0 && (
        <div className="text-lg text-white bg-surface-alt rounded-lg px-2.5 py-2">
          <div className="uppercase tracking-wide font-mono mb-1">Employer cost (not deducted from employee)</div>
          {entries.filter((e) => e.direction === 'employer_cost').map((e) => (
            <div key={e.id} className="flex justify-between">
              <span>{PAYROLL_CATEGORY_LABEL[e.category]}</span>
              <span>{fmtRWF(e.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Payroll() {
  const [period, setPeriod] = useState(currentPeriod());
  const [showRun, setShowRun] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const employeesQuery = useAllEmployeesForPicker();
  const payrollQuery = usePayroll({ period });
  const deleteEntry = useDeletePayrollEntry();

  const entriesByEmployee: Record<number, { name: string; entries: PayrollEntry[] }> = {};
  (payrollQuery.data ?? []).forEach((e) => {
    if (!entriesByEmployee[e.employeeId]) entriesByEmployee[e.employeeId] = { name: e.employeeName, entries: [] };
    entriesByEmployee[e.employeeId].entries.push(e);
  });

  const activeEmployees = (employeesQuery.data ?? []).filter((e) => e.isActive);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <input
          type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
          className="bg-surface-alt border border-border rounded-lg px-3 py-1.5 text-[12.5px]"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(true)} disabled={activeEmployees.length === 0}
            className="flex items-center gap-1.5 bg-surface-alt border border-border text-muted rounded-lg px-3 py-1.5 text-xs disabled:opacity-40"
          ><Plus size={13} /> One-off entry</button>
          <button
            onClick={() => setShowRun(true)} disabled={activeEmployees.length === 0}
            className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-1.5 text-xs disabled:opacity-40"
          ><Play size={13} /> Run payroll</button>
        </div>
      </div>

      {payrollQuery.isLoading && <div className="text-sm text-faint py-8">Loading payroll…</div>}

      {payrollQuery.data && Object.keys(entriesByEmployee).length === 0 && (
        <div className="text-[13px] text-faint py-8">No payroll entries for {period} yet — run payroll to get started.</div>
      )}

      {Object.keys(entriesByEmployee).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(entriesByEmployee).map(([empId, { name, entries }]) => (
            <EmployeePayrollCard key={empId} employeeName={name} entries={entries} onDelete={(id) => deleteEntry.mutate(id)} />
          ))}
        </div>
      )}

      {showRun && <RunPayrollModal employees={activeEmployees} defaultPeriod={period} onClose={() => setShowRun(false)} />}
      {showAdd && <AddPayrollEntryModal employees={activeEmployees} defaultPeriod={period} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
