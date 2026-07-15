'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { LeaveStatus, TaskScope } from '@/lib/types';
import type { LeavePage } from '@/app/api/leave/route';

const PAGE_SIZE = 25;

export function useLeaveRequests(scope: TaskScope) {
  return useInfiniteQuery({
    queryKey: ['leave', scope],
    queryFn: ({ pageParam }) => apiRequest<LeavePage>(`/api/leave?scope=${scope}&page=${pageParam}&limit=${PAGE_SIZE}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { startDate: string; endDate: string; reason?: string }) =>
      apiRequest<{ id: number }>('/api/leave', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request submitted');
    },
    onError: (err) => toast.error('Could not submit request', { description: (err as Error).message }),
  });
}

export function useDecideLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; status: LeaveStatus; decisionNote?: string }) =>
      apiRequest<{ ok: boolean }>(`/api/leave/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success(vars.status === 'approved' ? 'Leave approved' : 'Leave denied');
    },
    onError: (err) => toast.error('Could not decide request', { description: (err as Error).message }),
  });
}
