'use client';

import { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import type { ManagedUser } from '@/lib/types';
import { useUpdateUser } from '@/hooks/useUsers';

export function ResetPasswordModal({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const updateUser = useUpdateUser();

  const submit = () => {
    if (password.length < 8) return;
    updateUser.mutate({ id: user.id, password }, { onSuccess: onClose });
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-sm animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-base font-semibold">Reset password for {user.name}</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (at least 8 characters)" autoFocus
            className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]"
          />
          {updateUser.isError && <div className="text-[11px] text-danger">{(updateUser.error as Error).message}</div>}
          <button
            onClick={submit} disabled={password.length < 8 || updateUser.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><KeyRound size={14} /> {updateUser.isPending ? 'Saving…' : 'Set new password'}</button>
        </div>
      </div>
    </div>
  );
}
