'use client';

import { useState } from 'react';
import { UserPlus, KeyRound, Power, Loader2 } from 'lucide-react';
import type { ManagedUser, Role, RoleKey } from '@/lib/types';
import { useUsers, useUpdateUser } from '@/hooks/useUsers';
import { ROLE_ACCENT } from '@/lib/roleDisplay';
import { AddUserModal } from './AddUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';

function fmtDate(iso: string) {
  return new Date(iso.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function UsersManagement({ roles }: { roles: Role[] }) {
  const usersQuery = useUsers();
  const updateUser = useUpdateUser();
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const toggleActive = (u: ManagedUser) => {
    setBusyId(u.id);
    updateUser.mutate({ id: u.id, isActive: !u.isActive }, { onSettled: () => setBusyId(null) });
  };

  const changeRole = (u: ManagedUser, roleKey: RoleKey) => {
    if (roleKey === u.role.key) return;
    setBusyId(u.id);
    updateUser.mutate({ id: u.id, roleKey }, { onSettled: () => setBusyId(null) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-[13px] text-muted">
          {usersQuery.data ? `${usersQuery.data.length} accounts` : 'Loading…'}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-1.5 text-xs"
        ><UserPlus size={14} /> Add user</button>
      </div>

      {usersQuery.isLoading && <div className="text-sm text-faint py-8">Loading accounts…</div>}

      {usersQuery.data && (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-surface-alt text-left text-faint font-mono text-[10.5px] uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold">Email</th>
                <th className="px-4 py-2.5 font-semibold">Role</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Created</th>
                <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data.map((u) => {
                const accent = ROLE_ACCENT[u.role.key];
                const isBusy = busyId === u.id;
                return (
                  <tr key={u.id} className="border-t border-border-soft">
                    <td className="px-4 py-2.5 font-semibold">{u.name}</td>
                    <td className="px-4 py-2.5 text-muted">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={u.role.key} disabled={isBusy}
                        onChange={(e) => changeRole(u, e.target.value as RoleKey)}
                        className={`bg-transparent border border-border-soft rounded-md px-1.5 py-1 text-[11.5px] ${accent.text}`}
                      >
                        {roles.map((r) => <option key={r.key} value={r.key} className="text-primary bg-surface">{r.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${u.isActive ? 'text-success border-success' : 'text-faint border-border'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-faint">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setResetTarget(u)} title="Reset password"
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-surface-alt text-muted"
                        ><KeyRound size={13} /></button>
                        <button
                          onClick={() => toggleActive(u)} disabled={isBusy} title={u.isActive ? 'Deactivate' : 'Reactivate'}
                          className={`w-7 h-7 flex items-center justify-center rounded-md border ${u.isActive ? 'border-danger text-danger' : 'border-success text-success'} bg-surface-alt disabled:opacity-40`}
                        >{isBusy ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddUserModal roles={roles} onClose={() => setShowAdd(false)} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
    </div>
  );
}
