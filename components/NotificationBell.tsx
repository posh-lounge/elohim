'use client';

import { Bell } from 'lucide-react';
import { useUnreadCount } from '@/hooks/useUnreadCount';

export function NotificationBell() {
  const { data: count, isLoading } = useUnreadCount();

  return (
    <div className="relative inline-flex items-center">
      <Bell size={20} className="text-muted" />
      {!isLoading && count !== undefined && count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}