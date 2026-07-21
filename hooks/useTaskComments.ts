import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/clientApi';

export interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  authorName: string;
  authorRole: string;
}

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ['taskComments', taskId],
    queryFn: () => apiRequest<{ comments: Comment[] }>(`/api/tasks/${taskId}/comments`),
    enabled: !!taskId,
  });
}