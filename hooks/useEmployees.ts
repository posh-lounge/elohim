'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { Employee, EmploymentType } from '@/lib/types';
import type { EmployeesPage } from '@/app/api/employees/route';

const EMPLOYEES_KEY = ['employees'];
const PAGE_SIZE = 25;

export function useEmployees() {
  return useInfiniteQuery({
    queryKey: EMPLOYEES_KEY,
    queryFn: ({ pageParam }) => apiRequest<EmployeesPage>(`/api/employees?page=${pageParam}&limit=${PAGE_SIZE}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useAllEmployeesForPicker() {
  return useQuery({
    queryKey: ['employees-all-for-picker'],
    queryFn: () => apiRequest<EmployeesPage>('/api/employees?page=1&limit=100'),
    select: (data) => data.employees,
  });
}

export function useEmployeesByRole(roleKey: string | null) {
  return useQuery({
    queryKey: ['employees-by-role', roleKey],
    queryFn: () => apiRequest<{ employees: Employee[] }>(`/api/employees?role=${roleKey}`),
    select: (data) => data.employees,
    enabled: roleKey !== null,
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
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
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
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Employee updated');
    },
    onError: (err) => toast.error('Could not update employee', { description: (err as Error).message }),
  });
}
