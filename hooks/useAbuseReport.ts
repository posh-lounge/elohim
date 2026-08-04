'use client';

import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { toast } from 'sonner';

export function useAbuseReport() {
  return useMutation({
    mutationFn: (data: { taskId?: number; commentId?: number; reason: string }) =>
      apiRequest<{ id: number }>('/api/abuse-reports', { method: 'POST', body: data }),
    onSuccess: () => {
      toast.success('Report submitted anonymously');
    },
    onError: (err) => toast.error('Could not submit report', { description: (err as Error).message }),
  });
}