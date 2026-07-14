'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { EmploymentType } from '@/lib/types';
import { useCreateEmployee } from '@/hooks/useEmployees';

const DEPARTMENTS = ['Bar & Restaurant', 'Apartments', 'Recruitment & Staffing', 'Logistics & Clearing', 'Whole Business', 'Office of the Owner', 'Finance & Payroll'];

export function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('permanent');
  const createEmployee = useCreateEmployee();

  const submit = () => {
    if (!name.trim() || !position.trim()) return;
    createEmployee.mutate(
      { name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, position: position.trim(), department, employmentType },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Add an employee</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className={label}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alice Mutesi" className={field} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Position</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Waiter" className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={field}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Phone (optional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label className={label}>Employment type</label>
            <div className="flex gap-2">
              {(['permanent', 'contractor'] as EmploymentType[]).map((t) => (
                <button
                  key={t} onClick={() => setEmploymentType(t)}
                  className={`flex-1 text-[12.5px] py-2 rounded-lg border capitalize ${employmentType === t ? 'border-gold bg-gold-soft text-primary' : 'border-border text-muted'}`}
                >{t}</button>
              ))}
            </div>
            {employmentType === 'contractor' && (
              <div className="text-[10.5px] text-faint mt-1.5">Contractors aren't eligible for RSSB payroll entries.</div>
            )}
          </div>

          {createEmployee.isError && <div className="text-[11px] text-danger">{(createEmployee.error as Error).message}</div>}

          <button
            onClick={submit} disabled={!name.trim() || !position.trim() || createEmployee.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><UserPlus size={15} /> {createEmployee.isPending ? 'Adding…' : 'Add employee'}</button>
        </div>
      </div>
    </div>
  );
}
