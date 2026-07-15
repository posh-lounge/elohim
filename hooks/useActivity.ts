'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import type { ActivityPage } from '@/app/api/activity/route';

const PAGE_SIZE = 25;

export function useActivity() {
  return useInfiniteQuery({
    queryKey: ['activity'],
    queryFn: ({ pageParam }) => apiRequest<ActivityPage>(`/api/activity?page=${pageParam}&limit=${PAGE_SIZE}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    refetchInterval: 30_000,
  });
}
