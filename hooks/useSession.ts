'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import { queryKeys } from '@/lib/queryKeys';
import type { SessionUser } from '@/lib/types';

export function useSession() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiRequest<{ user: SessionUser }>('/api/auth/me'),
    select: (data) => data.user,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiRequest<{ user: SessionUser }>('/api/auth/login', { method: 'POST', body: input }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, { user: data.user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Signed out');
    },
  });
}
