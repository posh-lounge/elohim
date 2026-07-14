'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { Employee, EmploymentType } from '@/lib/types';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => apiRequest<{ employees: Employee[] }>('/api/employees'),
    select: (data) => data.employees,
  });
}

export interface NewEmployeeInput {
  name: string;
  phone?: string;
  email?: string;
  position: string;
  department: string;
  employmentType: EmploymentType;
  hireDate?: string;
  notes?: string;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewEmployeeInput) => apiRequest<{ id: number }>('/api/employees', { method: 'POST', body: input }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added', { description: input.name });
    },
    onError: (err) => toast.error('Could not add employee', { description: (err as Error).message }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number; employmentType?: EmploymentType; isActive?: boolean; phone?: string; email?: string; notes?: string }) =>
      apiRequest<{ ok: boolean }>(`/api/employees/${id}`, { method: 'PATCH', body: patch }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated');
    },
    onError: (err) => toast.error('Could not update employee', { description: (err as Error).message }),
  });
}
