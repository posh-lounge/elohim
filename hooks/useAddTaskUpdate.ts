'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';

export function useAddTaskUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, note, progress }: { taskId: number; note: string; progress: number }) =>
      apiRequest<{ id: number }>(`/api/tasks/${taskId}/updates`, { method: 'POST', body: { note, progress } }),
    onSuccess: () => {
      // Reports can also flip status (>=100% -> done), so refresh every board.
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Report posted');
    },
    onError: (err) => {
      toast.error('Could not post report', { description: (err as Error).message });
    },
  });
}
