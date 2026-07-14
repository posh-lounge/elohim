'use client';

import type { Priority, RoleKey } from '@/lib/types';
import { PRIORITY_ACCENT } from '@/lib/roleDisplay';

export function PriorityStamp({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-block font-mono text-[9.5px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 -rotate-2 ${PRIORITY_ACCENT[priority]}`}
    >
      {priority}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 bg-border-soft rounded-full overflow-hidden mt-2">
      <div
        className={`h-full transition-all ${value >= 100 ? 'bg-success' : 'bg-gold'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(status: string, dueDate: string | null) {
  if (status === 'done' || !dueDate) return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso.replace(' ', 'T') + 'Z').getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
