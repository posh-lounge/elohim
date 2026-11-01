'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationsModal } from './NotificationsModal';
import type { Task } from '@/lib/types';

export function UnreadCommentsBanner({
  onOpenTask,
}: {
  onOpenTask: (task: Task) => void;
}) {
  const { data, isLoading, isError } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const notifications = data?.notifications ?? [];
  const total = notifications.reduce((s, n) => s + n.unreadCount, 0);
  const latest = notifications[0];

  // Re-show the banner if the count goes up (new comment arrived while dismissed)
  useEffect(() => {
    if (total > 0) setDismissed(false);
  }, [total]);

  // If there's nothing left to show, close the modal too
  useEffect(() => {
    if (total === 0) setShowModal(false);
  }, [total]);

  if (isLoading || isError) return null;
  if (total === 0 || dismissed || !latest) {
    // Banner hidden, but if the user opened the modal before count dropped to 0,
    // the modal would already close via the effect above. Nothing to render.
    return null;
  }

  const plural = total === 1 ? 'comment' : 'comments';

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-[1320px] mx-auto px-4 pb-4">
          <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-700 to-rose-600 border border-rose-500/40 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl animate-in">
            {/* Icon + message */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle size={18} strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  {total} unread {plural} on your tasks
                </p>
                <p className="text-[12px] text-rose-100 leading-snug mt-0.5 truncate">
                  Latest: <span className="font-medium">{latest.task.title}</span>
                  {' — '}
                  <span className="italic">
                    {latest.latestComment.comment.slice(0, 80)}
                    {latest.latestComment.comment.length > 80 ? '…' : ''}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-md text-rose-100 hover:text-white hover:bg-white/10 transition"
                title="Dismiss"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-rose-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-50 transition whitespace-nowrap"
              >
                View now
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-in { animation: slideIn 220ms ease-out; }
        `}</style>
      </div>

      {/* Modal */}
      {showModal && (
        <NotificationsModal
          onClose={() => setShowModal(false)}
          onOpenTask={onOpenTask}
        />
      )}
    </>
  );
}