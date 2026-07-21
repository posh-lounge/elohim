import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';

export function useAddTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, comment }: { taskId: number; comment: string }) =>
      apiRequest<{ id: number }>(`/api/tasks/${taskId}/comments`, { method: 'POST', body: { comment } }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
      toast.success('Comment added');
    },
    onError: (err) => {
      toast.error('Could not add comment', { description: (err as Error).message });
    },
  });
}