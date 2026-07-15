'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { RoleContentItem } from '@/lib/types';

export function useEmployeeResponsibilities(employeeId: number | null) {
  return useQuery({
    queryKey: ['employee-responsibilities', employeeId],
    queryFn: () => apiRequest<{ responsibilities: RoleContentItem[] }>(`/api/employees/${employeeId}/responsibilities`),
    select: (data) => data.responsibilities,
    enabled: employeeId !== null,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, employeeId: number) {
  queryClient.invalidateQueries({ queryKey: ['employee-responsibilities', employeeId] });
}

export function useAddEmployeeResponsibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, text }: { employeeId: number; text: string }) =>
      apiRequest<{ id: number; text: string }>(`/api/employees/${employeeId}/responsibilities`, { method: 'POST', body: { text } }),
    onSuccess: (_data, vars) => { invalidate(queryClient, vars.employeeId); toast.success('Added'); },
    onError: (err) => toast.error('Could not add item', { description: (err as Error).message }),
  });
}

export function useUpdateEmployeeResponsibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, id, text }: { employeeId: number; id: number; text: string }) =>
      apiRequest<{ ok: boolean }>(`/api/employees/${employeeId}/responsibilities/${id}`, { method: 'PATCH', body: { text } }),
    onSuccess: (_data, vars) => { invalidate(queryClient, vars.employeeId); toast.success('Updated'); },
    onError: (err) => toast.error('Could not update item', { description: (err as Error).message }),
  });
}

export function useDeleteEmployeeResponsibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, id }: { employeeId: number; id: number }) =>
      apiRequest<{ ok: boolean }>(`/api/employees/${employeeId}/responsibilities/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, vars) => { invalidate(queryClient, vars.employeeId); toast.success('Removed'); },
    onError: (err) => toast.error('Could not remove item', { description: (err as Error).message }),
  });
}

export function useCopyRoleResponsibilities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: number) =>
      apiRequest<{ copied: number }>(`/api/employees/${employeeId}/responsibilities/copy-from-role`, { method: 'POST' }),
    onSuccess: (data, employeeId) => {
      invalidate(queryClient, employeeId);
      toast.success(data.copied > 0 ? `Copied ${data.copied} from role template` : 'Already up to date with the role template');
    },
    onError: (err) => toast.error('Could not copy from role', { description: (err as Error).message }),
  });
}
