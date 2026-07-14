'use client';

import {
  ClipboardList, ArrowRightLeft, MessageSquare, UserPlus, UserCog, UserX, UserCheck, KeyRound,
  LogIn, ShieldAlert, TrendingUp, LineChart, CalendarPlus, Check, X as XIcon,
} from 'lucide-react';
import { useActivity } from '@/hooks/useActivity';
import { ROLE_ACCENT } from '@/lib/roleDisplay';
import type { ActivityEntry } from '@/lib/types';

const ACTION_META: Record<string, { label: string; icon: any }> = {
  'task.created': { label: 'created a task', icon: ClipboardList },
  'task.status_changed': { label: 'moved a task', icon: ArrowRightLeft },
  'task.report_posted': { label: 'posted a report', icon: MessageSquare },
  'user.created': { label: 'added a user', icon: UserPlus },
  'user.role_changed': { label: "changed a user's role", icon: UserCog },
  'user.deactivated': { label: 'deactivated a user', icon: UserX },
  'user.reactivated': { label: 'reactivated a user', icon: UserCheck },
  'user.password_reset': { label: "reset a user's password", icon: KeyRound },
  'user.password_changed': { label: 'changed their password', icon: KeyRound },
  'login.success': { label: 'signed in', icon: LogIn },
  'login.failed': { label: 'failed to sign in', icon: ShieldAlert },
  'kpi.definition_created': { label: 'started tracking a metric', icon: TrendingUp },
  'kpi.entry_logged': { label: 'logged a metric reading', icon: LineChart },
  'leave.requested': { label: 'requested leave', icon: CalendarPlus },
  'leave.approved': { label: 'approved a leave request', icon: Check },
  'leave.denied': { label: 'denied a leave request', icon: XIcon },
};

function fmtDateTime(iso: string) {
  return new Date(iso.replace(' ', 'T') + 'Z').toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function metaSummary(entry: ActivityEntry): string | null {
  if (!entry.meta) return null;
  const m = entry.meta;
  if (m.title) return String(m.title);
  if (m.email) return String(m.email);
  if (m.label) return String(m.label);
  if (m.to) return `→ ${String(m.to).replace('_', ' ')}`;
  if (m.roleKey) return String(m.roleKey).replace('_', ' ');
  return null;
}

export function ActivityLog() {
  const activityQuery = useActivity();

  return (
    <div>
      <div className="text-[13px] text-muted mb-4">
        {activityQuery.data ? `${activityQuery.data.length} recent events` : 'Loading…'}
      </div>

      {activityQuery.isLoading && <div className="text-sm text-faint py-8">Loading activity…</div>}

      {activityQuery.data && (
        <div className="flex flex-col">
          {activityQuery.data.map((entry, i) => {
            const meta = ACTION_META[entry.action] ?? { label: entry.action, icon: ClipboardList };
            const Icon = meta.icon;
            const accent = entry.actor ? ROLE_ACCENT[entry.actor.role.key] : null;
            const summary = metaSummary(entry);
            const isFailure = entry.action === 'login.failed';

            return (
              <div key={entry.id} className={`flex items-center gap-3 py-2.5 ${i !== 0 ? 'border-t border-border-soft' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isFailure ? 'bg-danger/10' : accent?.softBg ?? 'bg-surface-alt'}`}>
                  <Icon size={13} className={isFailure ? 'text-danger' : accent?.text ?? 'text-faint'} />
                </div>
                <div className="min-w-0 flex-1 text-[12.5px]">
                  <span className="font-semibold">{entry.actor?.name ?? 'Unknown'}</span>{' '}
                  <span className="text-muted">{meta.label}</span>
                  {summary && <span className="text-faint"> — {summary}</span>}
                </div>
                <div className="text-[10.5px] text-faint font-mono whitespace-nowrap">{fmtDateTime(entry.createdAt)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
