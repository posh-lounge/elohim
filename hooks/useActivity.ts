'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import type { ActivityEntry } from '@/lib/types';

export function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () => apiRequest<{ entries: ActivityEntry[] }>('/api/activity'),
    select: (data) => data.entries,
    refetchInterval: 30_000,
  });
}
