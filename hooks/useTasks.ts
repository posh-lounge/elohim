'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { queryKeys } from '@/lib/queryKeys';
import type { RoleKey, Task, TaskScope } from '@/lib/types';

export function useTasks(scope: TaskScope) {
  return useQuery({
    queryKey: queryKeys.tasks(scope),
    queryFn: () => apiRequest<{ tasks: Task[] }>(`/api/tasks?scope=${scope}`),
    select: (data) => data.tasks,
    refetchInterval: 30_000, // light polling so a manager's board reflects new reports without a manual refresh
  });
}

/** For the org-chart drill-down: view one specific role's tasks regardless of the viewer's own scope. */
export function useRoleTasks(roleKey: RoleKey) {
  return useQuery({
    queryKey: ['tasks', 'role', roleKey],
    queryFn: () => apiRequest<{ tasks: Task[] }>(`/api/tasks?scope=role&role=${roleKey}`),
    select: (data) => data.tasks,
    refetchInterval: 30_000,
  });
}
