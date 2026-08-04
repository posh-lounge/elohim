'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useUpdateEmployee } from '@/hooks/useEmployees';

export function SalaryEditor({ employee, onClose }: { employee: { id: number; baseSalary?: number; name: string }; onClose: () => void }) {
  const [salary, setSalary] = useState(String(employee.baseSalary ?? ''));
  const updateEmployee = useUpdateEmployee();

  const submit = () => {
    const val = parseFloat(salary);
    if (isNaN(val) || val < 0) return;
    updateEmployee.mutate({ id: employee.id, baseSalary: val }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border rounded-xl w-full max-w-sm p-5 animate-fade-in">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-lg font-semibold">Base salary</h3>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <p className="text-xs text-faint mb-3">For {employee.name}</p>
        <input
          type="number" step="any" min="0"
          value={salary} onChange={(e) => setSalary(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px]"
          placeholder="Enter gross monthly salary"
        />
        {updateEmployee.isError && <div className="text-xs text-danger mt-2">{(updateEmployee.error as Error).message}</div>}
        <button
          onClick={submit} disabled={updateEmployee.isPending || !salary || parseFloat(salary) <= 0}
          className="w-full flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40 mt-3"
        >
          <Check size={15} /> {updateEmployee.isPending ? 'Saving…' : 'Save salary'}
        </button>
      </div>
    </div>
  );
}