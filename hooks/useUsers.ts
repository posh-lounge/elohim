'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { ManagedUser, RoleKey } from '@/lib/types';

const USERS_KEY = ['users'];

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => apiRequest<{ users: ManagedUser[] }>('/api/users'),
    select: (data) => data.users,
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
