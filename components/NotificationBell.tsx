'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, MessageSquare, X, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Task } from '@/lib/types';
import { timeAgo } from './primitives';

export function NotificationBell({ onOpenTask }: { onOpenTask: (task: Task) => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, error } = useNotifications();

  const notifications = data?.notifications ?? [];
  const totalUnread = notifications.reduce((s, n) => s + n.unreadCount, 0);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleRowClick = (task: Task) => {
    setOpen(false);
    onOpenTask(task);
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg hover:bg-surface-alt transition"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-muted" />
        {!isLoading && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] max-h-[480px] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-gold" />
              <span className="text-[13px] font-semibold">Notifications</span>
              {totalUnread > 0 && (
                <span className="text-[10px] font-mono bg-gold-soft text-primary px-1.5 py-0.5 rounded">
                  {totalUnread} new
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-faint hover:text-primary"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 justify-center py-10 text-sm text-faint">
                <Loader2 size={14} className="animate-spin" /> Loading notifications…
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 justify-center py-8 text-xs text-danger">
                <AlertCircle size={13} />
                {(error as Error)?.message ?? 'Failed to load notifications'}
              </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="text-center py-10">
                <Bell size={28} className="mx-auto text-faint/40 mb-2" />
                <p className="text-xs text-faint">You're all caught up.</p>
              </div>
            )}

            {notifications.map((n) => (
              <button
                key={n.task.id}
                onClick={() => handleRowClick(n.task)}
                className="w-full text-left px-4 py-3 border-b border-border-soft last:border-b-0 hover:bg-surface-alt transition"
              >
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[12.5px] font-semibold truncate">
                        {n.task.title}
                      </span>
                      <span className="text-[10px] font-mono text-faint whitespace-nowrap">
                        {timeAgo(n.latestComment.createdAt)}
                      </span>
                    </div>
                    <div className="text-[11px] text-faint mb-1">
                      {n.latestComment.authorName}
                      {' · '}
                      {n.unreadCount === 1
                        ? '1 new comment'
                        : `${n.unreadCount} new comments`}
                    </div>
                    <div className="text-[11.5px] text-muted line-clamp-2 leading-snug">
                      {n.latestComment.comment}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}