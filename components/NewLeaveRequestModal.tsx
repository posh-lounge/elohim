'use client';

import { useState } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import { useCreateLeaveRequest } from '@/hooks/useLeave';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function NewLeaveRequestModal({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [reason, setReason] = useState('');
  const createRequest = useCreateLeaveRequest();

  const submit = () => {
    if (!startDate || !endDate || endDate < startDate) return;
    createRequest.mutate({ startDate, endDate, reason: reason.trim() || undefined }, { onSuccess: onClose });
  };

  const field = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-[12.5px]';
  const label = 'font-mono text-[10.5px] uppercase tracking-wide text-faint mb-1.5 block';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/70 flex items-start justify-center p-6 z-50 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-xl w-full max-w-sm animate-fade-in">
        <div className="px-5 py-4 border-b border-border-soft flex justify-between items-center">
          <div className="font-display text-lg font-semibold">Request leave</div>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className={label}>To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={field} />
            </div>
          </div>
          {endDate < startDate && <div className="text-[11px] text-danger">End date can't be before start date.</div>}
          <div>
            <label className={label}>Reason (optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={`${field} resize-y`} />
          </div>
          {createRequest.isError && <div className="text-[11px] text-danger">{(createRequest.error as Error).message}</div>}
          <button
            onClick={submit} disabled={!startDate || !endDate || endDate < startDate || createRequest.isPending}
            className="flex items-center justify-center gap-1.5 bg-gold text-[#1A1408] font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40"
          ><CalendarPlus size={14} /> {createRequest.isPending ? 'Submitting…' : 'Submit request'}</button>
        </div>
      </div>
    </div>
  );
}
