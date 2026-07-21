'use client';

import { useState } from 'react';
import { X, Check, Calendar, AlertTriangle } from 'lucide-react';
import type { RoleKey, Task, TaskStatus } from '@/lib/types';
import { PriorityStamp, ProgressBar, fmtDate, isOverdue, timeAgo } from './primitives';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { useAddTaskUpdate } from '@/hooks/useAddTaskUpdate';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useAddTaskComment } from '@/hooks/useAddTaskComment';

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export function TaskModal({
  task,
  currentRoleKey,
  currentEmployeeId,
  roleLabelByKey,
  onClose,
}: {
  task: Task;
  currentRoleKey: RoleKey;
  currentEmployeeId: number | null;
  roleLabelByKey: Record<string, string>;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState(
    task.updates.length ? task.updates[task.updates.length - 1].progress : 25
  );
  const [comment, setComment] = useState('');

  const updateStatus = useUpdateTaskStatus();
  const addUpdate = useAddTaskUpdate();
  const {
    data: commentsData,
    error: commentsError,
    isLoading: commentsLoading,
  } = useTaskComments(task.id);
  const addComment = useAddTaskComment();

  const canReport = task.assignedToEmployee
    ? task.assignedToEmployee.id === currentEmployeeId
    : task.assignedToRole === currentRoleKey;
  const overdue = isOverdue(task.status, task.dueDate);
  const canComment = currentRoleKey === 'ops_manager' || currentRoleKey === 'owner';

  const submit = () => {
    if (!note.trim()) return;
    addUpdate.mutate(
      { taskId: task.id, note: note.trim(), progress },
      { onSuccess: () => setNote('') }
    );
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(
      { taskId: task.id, comment: comment.trim() },
      { onSuccess: () => setComment('') }
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-xl w-full max-w-xl animate-fade-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-start">
          <div>
            <div className="flex gap-2 items-center mb-1.5">
              <PriorityStamp priority={task.priority} />
              <span className="text-[11.5px] text-muted font-mono">
                {task.assignedToEmployee?.name ?? 'Unassigned'} ·{' '}
                {roleLabelByKey[task.assignedToRole]}
              </span>
            </div>
            <div className="font-display text-lg font-semibold">{task.title}</div>
            {task.responsibility && (
              <div className="text-[11.5px] text-faint italic mt-1">
                ↳ {task.responsibility.text}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-faint">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {task.description && (
            <p className="text-[13px] text-muted leading-relaxed mb-3.5">
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex gap-5 flex-wrap mb-4 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">
                Assigned to
              </div>
              <div className="mt-1">
                {task.assignedToEmployee?.name ?? 'Unassigned'}{' '}
                <span className="text-faint">({roleLabelByKey[task.assignedToRole]})</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">
                Assigned by
              </div>
              <div className="mt-1">{roleLabelByKey[task.assignedByRole]}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">
                Due
              </div>
              <div className={`mt-1 flex items-center gap-1 ${overdue ? 'text-danger' : ''}`}>
                {overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}{' '}
                {fmtDate(task.dueDate)}
                {overdue && ' · overdue'}
              </div>
            </div>
          </div>

          {/* Status buttons */}
          <div className="flex gap-1.5 flex-wrap mb-5">
            {STATUS_COLUMNS.map((c) => (
              <button
                key={c.key}
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ taskId: task.id, status: c.key })}
                className={`text-[11.5px] px-2.5 py-1.5 rounded-md font-semibold border disabled:opacity-40 ${
                  task.status === c.key
                    ? 'border-gold bg-gold-soft text-primary'
                    : 'border-border bg-surface-alt text-muted'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Progress reports */}
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-gold mb-2">
            Reports on this task
          </div>
          <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto mb-3.5">
            {task.updates.length === 0 && (
              <div className="text-xs text-faint">No reports yet.</div>
            )}
            {[...task.updates]
              .reverse()
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-surface-alt border border-border-soft rounded-lg px-3 py-2.5"
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-[11.5px] font-semibold">
                      {roleLabelByKey[u.authorRole]}
                    </span>
                    <span className="text-[10.5px] text-faint font-mono">
                      {timeAgo(u.ts)}
                    </span>
                  </div>
                  <div className="text-xs text-muted leading-relaxed">{u.note}</div>
                  <ProgressBar value={u.progress} />
                  <div className="text-[10.5px] text-faint mt-1 font-mono">
                    {u.progress}% complete
                  </div>
                </div>
              ))}
          </div>

          {/* Post report */}
          {canReport ? (
            <div className="border-t border-border-soft pt-3.5">
              <div className="text-[11.5px] text-muted mb-2">
                Post a progress report as {roleLabelByKey[currentRoleKey]}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What's the status? What's blocking you, if anything?"
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px] resize-y"
              />
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="text-[11px] text-faint whitespace-nowrap">
                  Progress
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="flex-1 accent-gold"
                />
                <span className="text-[11.5px] font-mono w-9">{progress}%</span>
                <button
                  onClick={submit}
                  disabled={!note.trim() || addUpdate.isPending}
                  className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-md px-3 py-2 text-xs disabled:opacity-40 whitespace-nowrap"
                >
                  <Check size={13} />{' '}
                  {addUpdate.isPending ? 'Posting…' : 'Post report'}
                </button>
              </div>
              {addUpdate.isError && (
                <div className="text-[11px] text-danger mt-2">
                  {(addUpdate.error as Error).message}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11.5px] text-faint border-t border-border-soft pt-3">
              Only {task.assignedToEmployee?.name ?? roleLabelByKey[task.assignedToRole]}{' '}
              can post progress reports on this task.
            </div>
          )}

          {/* ---- Comments section ---- */}
          <div className="border-t border-border-soft pt-3.5 mt-3">
            <div className="font-mono text-[10.5px] uppercase tracking-wider text-gold mb-2">
              Comments
            </div>
            {commentsLoading && (
              <div className="text-xs text-faint">Loading comments…</div>
            )}
            {commentsError && (
              <div className="text-xs text-danger">
                Failed to load comments. Please try again.
              </div>
            )}
            {commentsData?.comments?.length === 0 && (
              <div className="text-xs text-faint">No comments yet.</div>
            )}
            {commentsData?.comments?.map((c: any) => (
              <div
                key={c.id}
                className="bg-surface-alt border border-border-soft rounded-lg px-3 py-2.5 mb-2"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-[11.5px] font-semibold">
                    {c.author_name}{' '}
                    <span className="text-faint">({roleLabelByKey[c.author_role]})</span>
                  </span>
                  <span className="text-[10.5px] text-faint font-mono">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <div className="text-xs text-muted leading-relaxed">{c.comment}</div>
              </div>
            ))}
            {canComment && (
              <div className="mt-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (visible to all)"
                  rows={2}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px] resize-y"
                />
                <button
                  onClick={submitComment}
                  disabled={!comment.trim() || addComment.isPending}
                  className="mt-1 bg-gold text-[#1A1408] font-bold rounded-md px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  {addComment.isPending ? 'Posting…' : 'Post comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}