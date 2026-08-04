'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';
import { toast } from 'sonner';

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...data }: { taskId: number; title?: string; description?: string; dueDate?: string; priority?: string; assignedToEmployeeId?: number; responsibilityId?: number }) =>
      apiRequest<{ ok: boolean }>(`/api/tasks/${taskId}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    },
    onError: (err) => toast.error('Could not update task', { description: (err as Error).message }),
  });
}