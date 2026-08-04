'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => apiRequest<{ count: number }>('/api/tasks/unread-count'),
    select: (data) => data.count,
    refetchInterval: 60_000,
  });
}