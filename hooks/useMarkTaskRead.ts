'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { toast } from 'sonner';

export function useMarkTaskRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) =>
      apiRequest<{ ok: boolean }>(`/api/tasks/${taskId}/read`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) =>
      toast.error('Could not mark as read', { description: (err as Error).message }),
  });
}