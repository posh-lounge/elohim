'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { KpiDefinition, RoleKey, TaskScope } from '@/lib/types';

export function useKpis(scope: TaskScope) {
  return useQuery({
    queryKey: ['kpis', scope],
    queryFn: () => apiRequest<{ definitions: KpiDefinition[] }>(`/api/kpis?scope=${scope}`),
    select: (data) => data.definitions,
  });
}

export function useCreateKpiDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { roleKey: RoleKey; label: string; unit?: string; targetValue?: number }) =>
      apiRequest<{ id: number }>('/api/kpis', { method: 'POST', body: input }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Metric added', { description: input.label });
    },
    onError: (err) => toast.error('Could not add metric', { description: (err as Error).message }),
  });
}

export function useAddKpiEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ definitionId, ...body }: { definitionId: number; value: number; periodDate: string; note?: string }) =>
      apiRequest<{ id: number }>(`/api/kpis/${definitionId}/entries`, { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Reading logged');
    },
    onError: (err) => toast.error('Could not log reading', { description: (err as Error).message }),
  });
}
