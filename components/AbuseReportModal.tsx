'use client';

import { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { useAbuseReport } from '@/hooks/useAbuseReport';

export function AbuseReportModal({ taskId, commentId, onClose }: { taskId?: number; commentId?: number; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const report = useAbuseReport();

  const submit = () => {
    if (!reason.trim()) return;
    report.mutate(
      { taskId, commentId, reason: reason.trim() },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md p-5 animate-fade-in">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-lg font-semibold">Report abuse</h3>
          <button onClick={onClose} className="text-faint"><X size={18} /></button>
        </div>
        <p className="text-xs text-faint mb-3">This report will be sent anonymously to the owner.</p>
        <textarea
          value={reason} onChange={(e) => setReason(e.target.value)}
          rows={4} className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-[12.5px] resize-y"
          placeholder="Describe the issue…"
        />
        {report.isError && <div className="text-xs text-danger mt-2">{(report.error as Error).message}</div>}
        <button
          onClick={submit} disabled={!reason.trim() || report.isPending}
          className="w-full flex items-center justify-center gap-1.5 bg-danger text-white font-bold rounded-lg py-2.5 text-[13px] disabled:opacity-40 mt-3"
        >
          <Flag size={15} /> {report.isPending ? 'Submitting…' : 'Submit report'}
        </button>
      </div>
    </div>
  );
}