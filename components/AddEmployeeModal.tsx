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
  const [hireDate, setHireDate] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');

  const createEmployee = useCreateEmployee();

  const submit = () => {
    if (!name.trim() || !position.trim()) return;
    createEmployee.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        position: position.trim(),
        department,
        employmentType,
        hireDate: hireDate || undefined,
        notes: notes.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        nationalId: nationalId.trim() || undefined,
        address: address.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        emergencyContactRelationship: emergencyContactRelationship.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccount: bankAccount.trim() || undefined,
        tinNumber: tinNumber.trim() || undefined,
        socialSecurityNumber: socialSecurityNumber.trim() || undefined,
      },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';
  const section = 'font-mono text-[10.5px] uppercase tracking-wide text-gold mb-2 mt-1 border-b border-border-soft pb-1';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-2xl animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Add an employee</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

          {/* ── Basic info ─────────────────────────────────────────── */}
          <div className={section}>Basic information</div>

          <div>
            <label className={label}>Full name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alice Mutesi" className={field} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Position *</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Waiter" className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Department *</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={field}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7xx xxx xxx" className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Date of birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>National ID</label>
              <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="e.g. 1199880012345678" className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Hire date</label>
              <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className={field} />
            </div>
          </div>

          <div>
            <label className={label}>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Kigali, Nyarugenge" className={field} />
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

          {/* ── Emergency contact ──────────────────────────────────── */}
          <div className={section}>Emergency contact</div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Contact name</label>
              <input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Phone</label>
              <input value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Relationship</label>
              <input value={emergencyContactRelationship} onChange={(e) => setEmergencyContactRelationship(e.target.value)} placeholder="e.g. Spouse, Parent" className={field} />
            </div>
          </div>

          {/* ── Bank & tax ────────────────────────────────────────── */}
          <div className={section}>Bank & tax information</div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Bank name</label>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Bank of Kigali" className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Account number</label>
              <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className={field} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>TIN number</label>
              <input value={tinNumber} onChange={(e) => setTinNumber(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>Social security number</label>
              <input value={socialSecurityNumber} onChange={(e) => setSocialSecurityNumber(e.target.value)} className={field} />
            </div>
          </div>

          {/* ── Notes ─────────────────────────────────────────────── */}
          <div className={section}>Notes</div>

          <div>
            <label className={label}>Internal notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything the team should know about this employee"
              className={`${field} resize-none`}
            />
          </div>

          {createEmployee.isError && (
            <div className="text-[11px] text-danger">{(createEmployee.error as Error).message}</div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border-soft">
          <div className="text-[10.5px] text-faint mb-2">
            Profile photo and documents can be added after saving — open the employee's profile from the roster.
          </div>
          <button
            onClick={submit}
            disabled={!name.trim() || !position.trim() || createEmployee.isPending}
            className="w-full flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><UserPlus size={15} /> {createEmployee.isPending ? 'Adding…' : 'Add employee'}</button>
        </div>
      </div>
    </div>
  );
}