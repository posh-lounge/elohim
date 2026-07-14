'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { RoleKey } from '@/lib/types';

type ItemKind = 'responsibilities' | 'kpi-criteria';

export function useAddRoleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleKey, kind, text }: { roleKey: RoleKey; kind: ItemKind; text: string }) =>
      apiRequest<{ id: number; text: string }>(`/api/roles/${roleKey}/${kind}`, { method: 'POST', body: { text } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Added');
    },
    onError: (err) => toast.error('Could not add item', { description: (err as Error).message }),
  });
}

export function useUpdateRoleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleKey, kind, id, text }: { roleKey: RoleKey; kind: ItemKind; id: number; text: string }) =>
      apiRequest<{ ok: boolean }>(`/api/roles/${roleKey}/${kind}/${id}`, { method: 'PATCH', body: { text } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Updated');
    },
    onError: (err) => toast.error('Could not update item', { description: (err as Error).message }),
  });
}

export function useDeleteRoleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleKey, kind, id }: { roleKey: RoleKey; kind: ItemKind; id: number }) =>
      apiRequest<{ ok: boolean }>(`/api/roles/${roleKey}/${kind}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Removed');
    },
    onError: (err) => toast.error('Could not remove item', { description: (err as Error).message }),
  });
}
