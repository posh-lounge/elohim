'use client';

import { X, MessageSquare, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Task } from '@/lib/types';
import { timeAgo } from './primitives';

export function NotificationsModal({
  onClose,
  onOpenTask,
}: {
  onClose: () => void;
  onOpenTask: (task: Task) => void;
}) {
  const { data, isLoading, isError, error } = useNotifications();
  const notifications = data?.notifications ?? [];
  const total = notifications.reduce((s, n) => s + n.unreadCount, 0);

  const handleRowClick = (task: Task) => {
    onClose();
    onOpenTask(task);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pointer-events-none">
        <div className="bg-surface border border-border rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col pointer-events-auto shadow-2xl mt-[8vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-gold" />
              <h2 className="text-[15px] font-semibold">Notifications</h2>
              {total > 0 && (
                <span className="text-[10.5px] font-mono bg-gold-soft text-primary px-2 py-0.5 rounded-full">
                  {total} unread
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-faint hover:text-primary p-1"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 justify-center py-16 text-sm text-faint">
                <Loader2 size={15} className="animate-spin" /> Loading notifications…
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 justify-center py-12 text-sm text-danger">
                <AlertCircle size={15} />
                {(error as Error)?.message ?? 'Failed to load notifications'}
              </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare size={32} className="mx-auto text-faint/30 mb-3" />
                <p className="text-sm text-faint">You're all caught up.</p>
                <p className="text-[11.5px] text-faint/70 mt-1">
                  No unread comments on your tasks.
                </p>
              </div>
            )}

            {notifications.map((n) => (
              <button
                key={n.task.id}
                onClick={() => handleRowClick(n.task)}
                className="w-full text-left px-5 py-3.5 border-b border-border-soft last:border-b-0 hover:bg-surface-alt transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[13px] font-semibold leading-snug truncate">
                        {n.task.title}
                      </span>
                      <span className="text-[10.5px] font-mono text-faint whitespace-nowrap flex-shrink-0">
                        {timeAgo(n.latestComment.createdAt)}
                      </span>
                    </div>
                    <div className="text-[11px] text-faint mb-1.5">
                      {n.latestComment.authorName}
                      {' · '}
                      <span className="text-gold">
                        {n.unreadCount === 1
                          ? '1 new comment'
                          : `${n.unreadCount} new comments`}
                      </span>
                    </div>
                    <div className="text-[12px] text-muted leading-relaxed line-clamp-2">
                      {n.latestComment.comment}
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-faint group-hover:text-gold mt-1 flex-shrink-0 transition"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border-soft bg-surface-alt/40 flex-shrink-0">
            <p className="text-[11px] text-faint">
              Click any row to open the task and reply. Unread badges clear
              automatically once you view a task.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}