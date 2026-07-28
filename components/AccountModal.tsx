'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateProfile } from '@/hooks/useUsers';

export function AccountModal({
  userName,
  userEmail,
  userPhone,
  onClose,
}: {
  userName: string;
  userEmail: string;
  userPhone: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const updateProfile = useUpdateProfile();

  const submit = () => {
    if (!currentPassword) {
      toast.error('Please enter your current password to save changes');
      return;
    }

    const payload: { currentPassword: string; name?: string; email?: string; phone?: string; newPassword?: string } = {
      currentPassword,
    };

    if (name.trim() !== userName) payload.name = name.trim();
    if (email.trim() !== userEmail) payload.email = email.trim();
    if (phone.trim() !== userPhone) payload.phone = phone.trim();
    if (newPassword) {
      if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 1) {
      toast.info('No changes to save');
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setCurrentPassword('');
        setNewPassword('');
        onClose();
      },
    });
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-sm animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-base font-semibold">Account settings</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint block mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </div>
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint block mb-1">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          </div>

          <hr className="border-border-soft" />

          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint block mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to save changes"
              className={field}
            />
          </div>
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wide text-faint block mb-1">New password (optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className={field}
            />
          </div>

          <button
            onClick={submit}
            disabled={!currentPassword || updateProfile.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          >
            <Save size={14} /> {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}