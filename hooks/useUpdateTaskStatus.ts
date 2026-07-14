'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { TaskStatus } from '@/lib/types';

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
};

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      apiRequest<{ ok: boolean }>(`/api/tasks/${taskId}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Moved to ${STATUS_LABEL[vars.status]}`);
    },
    onError: (err) => {
      toast.error('Could not move task', { description: (err as Error).message });
    },
  });
}
