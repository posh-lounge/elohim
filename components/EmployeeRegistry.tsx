'use client';

import { useState } from 'react';
import { UserPlus, Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { useEmployees, useUpdateEmployee } from '@/hooks/useEmployees';
import { AddEmployeeModal } from './AddEmployeeModal';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EmployeeRegistry({ canManage }: { canManage: boolean }) {
  const employeesQuery = useEmployees();
  const updateEmployee = useUpdateEmployee();
  const [showAdd, setShowAdd] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'permanent' | 'contractor'>('all');

  const toggleActive = (e: Employee) => {
    setBusyId(e.id);
    updateEmployee.mutate({ id: e.id, isActive: !e.isActive }, { onSettled: () => setBusyId(null) });
  };

  const filtered = (employeesQuery.data ?? []).filter((e) => filter === 'all' || e.employmentType === filter);
  const permCount = (employeesQuery.data ?? []).filter((e) => e.employmentType === 'permanent').length;
  const contractorCount = (employeesQuery.data ?? []).filter((e) => e.employmentType === 'contractor').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5">
          {(['all', 'permanent', 'contractor'] as const).map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border capitalize ${filter === f ? 'border-gold bg-gold-soft text-primary' : 'border-border text-muted'}`}
            >{f}{f === 'permanent' && ` (${permCount})`}{f === 'contractor' && ` (${contractorCount})`}</button>
          ))}
        </div>
        {canManage && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-1.5 text-xs"
          ><UserPlus size={13} /> Add employee</button>
        )}
      </div>

      {employeesQuery.isLoading && <div className="text-sm text-faint py-8">Loading roster…</div>}

      {employeesQuery.data && (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-surface-alt text-left text-faint font-mono text-[10.5px] uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold">Position</th>
                <th className="px-4 py-2.5 font-semibold">Department</th>
                <th className="px-4 py-2.5 font-semibold">Type</th>
                <th className="px-4 py-2.5 font-semibold">System access</th>
                <th className="px-4 py-2.5 font-semibold">Hired</th>
                {canManage && <th className="px-4 py-2.5 font-semibold text-right">Status</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const isBusy = busyId === e.id;
                return (
                  <tr key={e.id} className={`border-t border-border-soft ${!e.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-2.5 font-semibold">{e.name}</td>
                    <td className="px-4 py-2.5 text-muted">{e.position}</td>
                    <td className="px-4 py-2.5 text-muted">{e.department}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded-full border capitalize ${e.employmentType === 'permanent' ? 'text-success border-success' : 'text-gold border-gold'}`}>
                        {e.employmentType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {e.hasSystemAccess
                        ? <span className="flex items-center gap-1 text-[11px] text-success"><Wifi size={12} /> Yes</span>
                        : <span className="flex items-center gap-1 text-[11px] text-faint"><WifiOff size={12} /> No</span>}
                    </td>
                    <td className="px-4 py-2.5 text-faint">{fmtDate(e.hireDate)}</td>
                    {canManage && (
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => toggleActive(e)} disabled={isBusy}
                          className={`text-[11px] px-2.5 py-1 rounded-md border ${e.isActive ? 'border-danger text-danger' : 'border-success text-success'} disabled:opacity-40`}
                        >{isBusy ? <Loader2 size={11} className="animate-spin inline" /> : (e.isActive ? 'Deactivate' : 'Reactivate')}</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
