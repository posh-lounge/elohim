// components/NotificationBell.tsx
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationsModal } from './NotificationsModal';
import type { Task } from '@/lib/types';

export function NotificationBell({ onOpenTask }: { onOpenTask: (task: Task) => void }) {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();

  const total = (data?.notifications ?? []).reduce((s, n) => s + n.unreadCount, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-1.5 rounded-lg hover:bg-surface-alt transition"
        title="Notifications"
      >
        <Bell size={20} className="text-muted" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <NotificationsModal
          onClose={() => setOpen(false)}
          onOpenTask={onOpenTask}
        />
      )}
    </>
  );
}