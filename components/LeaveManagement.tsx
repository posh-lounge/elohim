'use client';

import { useState } from 'react';
import { CalendarPlus, Check, X as XIcon, Loader2, ChevronDown } from 'lucide-react';
import type { LeaveRequest, RoleKey, TaskScope } from '@/lib/types';
import { ASSIGNABLE_ROLES } from '@/lib/types';
import { useLeaveRequests, useDecideLeaveRequest } from '@/hooks/useLeave';
import { NewLeaveRequestModal } from './NewLeaveRequestModal';

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-gold border-gold',
  approved: 'text-success border-success',
  denied: 'text-danger border-danger',
};

export function LeaveManagement({ currentUserId, currentRoleKey, roleLabelByKey, canManage, isTopLevel }: {
  currentUserId: number; currentRoleKey: RoleKey; roleLabelByKey: Record<string, string>;
  canManage: boolean; isTopLevel: boolean;
}) {
  const [scope, setScope] = useState<TaskScope>('my');
  const [showNew, setShowNew] = useState(false);
  const requestsQuery = useLeaveRequests(scope);
  const requests = requestsQuery.data?.pages.flatMap((p) => p.requests) ?? [];
  const decide = useDecideLeaveRequest();
  const [busyId, setBusyId] = useState<number | null>(null);

  const tabs: { key: TaskScope; label: string }[] = [
    { key: 'my', label: 'My Requests' },
    ...(canManage ? [{ key: 'team' as TaskScope, label: 'Team Requests' }] : []),
    ...(isTopLevel ? [{ key: 'all' as TaskScope, label: 'All' }] : []),
  ];

  const canDecide = (req: LeaveRequest) => {
    if (req.status !== 'pending') return false;
    const isSelf = req.user.id === currentUserId;
    if (isSelf) return currentRoleKey === 'owner';
    return (ASSIGNABLE_ROLES[currentRoleKey] ?? []).includes(req.user.roleKey);
  };

  const act = (id: number, status: 'approved' | 'denied') => {
    setBusyId(id);
    decide.mutate({ id, status }, { onSettled: () => setBusyId(null) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key} onClick={() => setScope(t.key)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border ${scope === t.key ? 'border-gold bg-gold-soft text-primary' : 'border-border text-muted'}`}
            >{t.label}</button>
          ))}
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg px-3 py-1.5 text-xs"
        ><CalendarPlus size={13} /> Request leave</button>
      </div>

      {requestsQuery.isLoading && <div className="text-sm text-faint py-8">Loading requests…</div>}
      {requestsQuery.data && requests.length === 0 && (
        <div className="text-[13px] text-faint py-8">Nothing here yet.</div>
      )}

      {requests.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {requests.map((req) => {
            const isBusy = busyId === req.id;
            return (
              <div key={req.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold">{req.user.name}</span>
                    <span className="text-[10.5px] text-faint font-mono">{roleLabelByKey[req.user.roleKey]}</span>
                    <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full border ${STATUS_STYLE[req.status]}`}>{req.status}</span>
                  </div>
                  <div className="text-[12px] text-muted">{fmtDate(req.startDate)} → {fmtDate(req.endDate)}</div>
                  {req.reason && <div className="text-[11.5px] text-faint mt-0.5">{req.reason}</div>}
                  {req.decisionNote && <div className="text-[11.5px] text-faint mt-0.5 italic">"{req.decisionNote}" — {req.decidedByName}</div>}
                </div>
                {canDecide(req) && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => act(req.id, 'approved')} disabled={isBusy}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border border-success text-success disabled:opacity-40"
                    >{isBusy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve</button>
                    <button
                      onClick={() => act(req.id, 'denied')} disabled={isBusy}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border border-danger text-danger disabled:opacity-40"
                    ><XIcon size={12} /> Deny</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {requestsQuery.hasNextPage && (
        <button
          onClick={() => requestsQuery.fetchNextPage()} disabled={requestsQuery.isFetchingNextPage}
          className="w-full flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-lg border border-border text-muted text-xs disabled:opacity-50"
        >
          {requestsQuery.isFetchingNextPage
            ? <><Loader2 size={13} className="animate-spin" /> Loading…</>
            : <><ChevronDown size={13} /> Load more</>}
        </button>
      )}

      {showNew && <NewLeaveRequestModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
