'use client';

import {
  ClipboardList, ArrowRightLeft, MessageSquare, UserPlus, UserCog, UserX, UserCheck, KeyRound,
  LogIn, ShieldAlert, TrendingUp, LineChart, CalendarPlus, Check, X as XIcon,
  ListPlus, Pencil, Trash2, Wallet, Receipt, Loader2, ChevronDown, Copy,
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
  'role.responsibility_item_added': { label: 'added a responsibility', icon: ListPlus },
  'role.responsibility_item_edited': { label: 'edited a responsibility', icon: Pencil },
  'role.responsibility_item_deleted': { label: 'removed a responsibility', icon: Trash2 },
  'role.kpi_item_added': { label: 'added a KPI criterion', icon: ListPlus },
  'role.kpi_item_edited': { label: 'edited a KPI criterion', icon: Pencil },
  'role.kpi_item_deleted': { label: 'removed a KPI criterion', icon: Trash2 },
  'employee.created': { label: 'added an employee', icon: UserPlus },
  'employee.updated': { label: 'updated an employee', icon: UserCog },
  'employee.responsibility_added': { label: "added to an employee's responsibilities", icon: ListPlus },
  'employee.responsibility_edited': { label: "edited an employee's responsibility", icon: Pencil },
  'employee.responsibility_deleted': { label: "removed an employee's responsibility", icon: Trash2 },
  'employee.responsibilities_copied': { label: 'copied role responsibilities to an employee', icon: Copy },
  'payroll.run': { label: 'ran payroll', icon: Wallet },
  'payroll.entry_added': { label: 'added a payroll entry', icon: Receipt },
  'payroll.entry_deleted': { label: 'removed a payroll entry', icon: Trash2 },
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
  if (m.name) return String(m.name);
  if (m.email) return String(m.email);
  if (m.label) return String(m.label);
  if (m.text) return String(m.text);
  if (entry.action === 'payroll.run' && m.period) return `${m.period} — gross ${Number(m.gross).toLocaleString()} RWF`;
  if (entry.action === 'payroll.entry_added' && m.category) return `${String(m.category).replace(/_/g, ' ')} — ${Number(m.amount).toLocaleString()} RWF`;
  if (entry.action === 'employee.responsibilities_copied' && m.copied !== undefined) return `${m.copied} item${m.copied === 1 ? '' : 's'}`;
  if (m.to) return `→ ${String(m.to).replace('_', ' ')}`;
  if (m.roleKey) return String(m.roleKey).replace('_', ' ');
  return null;
}

export function ActivityLog() {
  const activityQuery = useActivity();
  const entries = activityQuery.data?.pages.flatMap((p) => p.entries) ?? [];
  const total = activityQuery.data?.pages[0]?.total ?? 0;

  return (
    <div>
      <div className="text-[13px] text-muted mb-4">
        {activityQuery.data ? `${entries.length} of ${total} events` : 'Loading…'}
      </div>

      {activityQuery.isLoading && <div className="text-sm text-faint py-8">Loading activity…</div>}

      {entries.length === 0 && activityQuery.isSuccess && (
        <div className="text-sm text-faint py-8">Nothing here yet.</div>
      )}

      {entries.length > 0 && (
        <div className="flex flex-col">
          {entries.map((entry, i) => {
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

      {activityQuery.hasNextPage && (
        <button
          onClick={() => activityQuery.fetchNextPage()}
          disabled={activityQuery.isFetchingNextPage}
          className="w-full flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-lg border border-border text-muted text-xs disabled:opacity-50"
        >
          {activityQuery.isFetchingNextPage
            ? <><Loader2 size={13} className="animate-spin" /> Loading…</>
            : <><ChevronDown size={13} /> Load more</>}
        </button>
      )}
    </div>
  );
}
