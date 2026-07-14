'use client';

import { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { useChangePassword } from '@/hooks/useUsers';

export function AccountModal({ userName, onClose }: { userName: string; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const changePassword = useChangePassword();

  const submit = () => {
    if (!currentPassword || newPassword.length < 8) return;
    changePassword.mutate({ currentPassword, newPassword }, {
      onSuccess: () => { setCurrentPassword(''); setNewPassword(''); onClose(); },
    });
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-sm animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-base font-semibold">{userName}'s account</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-faint">Change password</div>
          <input
            type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password" className={field}
          />
          <input
            type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (at least 8 characters)" className={field}
          />
          <button
            onClick={submit} disabled={!currentPassword || newPassword.length < 8 || changePassword.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><KeyRound size={14} /> {changePassword.isPending ? 'Saving…' : 'Change password'}</button>
        </div>
      </div>
    </div>
  );
}
