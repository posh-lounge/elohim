'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { queryKeys } from '@/lib/queryKeys';
import type { Task, TaskScope } from '@/lib/types';

export function useTasks(scope: TaskScope) {
  return useQuery({
    queryKey: queryKeys.tasks(scope),
    queryFn: () => apiRequest<{ tasks: Task[] }>(`/api/tasks?scope=${scope}`),
    select: (data) => data.tasks,
    refetchInterval: 30_000, // light polling so a manager's board reflects new reports without a manual refresh
  });
}
