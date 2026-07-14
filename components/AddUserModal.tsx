'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Role, RoleKey } from '@/lib/types';
import { useCreateUser } from '@/hooks/useUsers';

export function AddUserModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleKey, setRoleKey] = useState<RoleKey>(roles[0]?.key ?? 'personal_assistant');
  const createUser = useCreateUser();

  const submit = () => {
    if (!name.trim() || !email.trim() || password.length < 8) return;
    createUser.mutate(
      { name: name.trim(), email: email.trim(), password, roleKey },
      { onSuccess: onClose }
    );
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Add a user account</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className={label}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grace Uwase" className={field} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@elohimgroup.rw" className={field} />
          </div>
          <div>
            <label className={label}>Temporary password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={field} />
            <div className="text-[10.5px] text-faint mt-1">They can change this later from their own Account menu.</div>
          </div>
          <div>
            <label className={label}>Role</label>
            <select value={roleKey} onChange={(e) => setRoleKey(e.target.value as RoleKey)} className={field}>
              {roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          {createUser.isError && <div className="text-[11px] text-danger">{(createUser.error as Error).message}</div>}

          <button
            onClick={submit} disabled={!name.trim() || !email.trim() || password.length < 8 || createUser.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><UserPlus size={15} /> {createUser.isPending ? 'Adding…' : 'Add user'}</button>
        </div>
      </div>
    </div>
  );
}
