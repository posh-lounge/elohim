'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { RoleKey } from '@/lib/types';
import type { UsersPage } from '@/app/api/users/route';

const USERS_KEY = ['users'];
const PAGE_SIZE = 25;

export function useUsers() {
  return useInfiniteQuery({
    queryKey: USERS_KEY,
    queryFn: ({ pageParam }) => apiRequest<UsersPage>(`/api/users?page=${pageParam}&limit=${PAGE_SIZE}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export interface NewUserInput {
  name: string;
  email: string;
  password: string;
  roleKey: RoleKey;
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewUserInput) => apiRequest<{ id: number }>('/api/users', { method: 'POST', body: input }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: ['employees'] }); // creating a user also creates a linked employee
      toast.success(`${input.name} added`, { description: `Can now sign in as ${input.roleKey.replace('_', ' ')}.` });
    },
    onError: (err) => toast.error('Could not add user', { description: (err as Error).message }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number; roleKey?: RoleKey; isActive?: boolean; password?: string }) =>
      apiRequest<{ ok: boolean }>(`/api/users/${id}`, { method: 'PATCH', body: patch }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      if ('isActive' in vars) toast.success(vars.isActive ? 'User reactivated' : 'User deactivated');
      else if ('roleKey' in vars) toast.success('Role updated');
      else toast.success('Password reset');
    },
    onError: (err) => toast.error('Update failed', { description: (err as Error).message }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      apiRequest<{ ok: boolean }>('/api/auth/change-password', { method: 'POST', body: input }),
    onSuccess: () => toast.success('Password changed'),
    onError: (err) => toast.error('Could not change password', { description: (err as Error).message }),
  });
}
