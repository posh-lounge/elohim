'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export function AbuseReports() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['abuseReports'],
    queryFn: () => apiRequest<{ reports: any[] }>('/api/abuse-reports'),
  });

  const resolve = useMutation({
    mutationFn: (id: number) => apiRequest<{ ok: boolean }>(`/api/abuse-reports/${id}`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abuseReports'] });
      toast.success('Report resolved');
    },
    onError: (err) => toast.error('Could not resolve', { description: (err as Error).message }),
  });

  if (isLoading) return <div className="text-sm text-faint py-8">Loading reports…</div>;
  if (error) return <div className="text-sm text-danger py-8">Failed to load.</div>;

  const reports = data?.reports ?? [];

  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-wider text-gold mb-2">
        Abuse Reports
      </div>
      {reports.length === 0 && <div className="text-sm text-faint">No reports.</div>}
      {reports.map((r: any) => (
        <div key={r.id} className="bg-surface-alt border border-border-soft rounded-lg px-4 py-3 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-faint">
                {r.task_id ? `Task: ${r.task_title}` : r.comment_id ? `Comment (ID: ${r.comment_id})` : 'Unknown'}
              </div>
              <div className="text-sm mt-1">{r.reason}</div>
              <div className="text-[10.5px] text-faint mt-1">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div>
              {r.status === 'pending' ? (
                <button
                  onClick={() => resolve.mutate(r.id)}
                  className="flex items-center gap-1 bg-gold text-[#1A1408] rounded px-2 py-1 text-xs font-bold disabled:opacity-40"
                >
                  <CheckCircle size={12} /> Resolve
                </button>
              ) : (
                <span className="text-xs text-success">Resolved</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}