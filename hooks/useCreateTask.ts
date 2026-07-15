'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { RoleKey, Priority } from '@/lib/types';

export interface NewTaskInput {
  title: string;
  description?: string;
  assignedToRole: RoleKey;
  responsibilityId: number;
  priority: Priority;
  dueDate?: string | null;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewTaskInput) => apiRequest<{ id: number }>('/api/tasks', { method: 'POST', body: input }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created', { description: input.title });
    },
    onError: (err) => {
      toast.error('Could not create task', { description: (err as Error).message });
    },
  });
}
