import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import type { TaskNotification } from '@/lib/types';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiRequest<{ notifications: TaskNotification[] }>('/api/notifications'),
    staleTime: 15_000,
    refetchInterval: 60_000,     // auto-refresh every minute
    refetchOnWindowFocus: true,
  });
}