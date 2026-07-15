'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { PayrollCategory, PayrollEntry } from '@/lib/types';

export function usePayroll(filters: { employeeId?: number; period?: string }) {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set('employeeId', String(filters.employeeId));
  if (filters.period) params.set('period', filters.period);

  return useQuery({
    queryKey: ['payroll', filters.employeeId ?? null, filters.period ?? null],
    queryFn: () => apiRequest<{ entries: PayrollEntry[] }>(`/api/payroll?${params.toString()}`),
    select: (data) => data.entries,
  });
}

export interface NewPayrollEntryInput {
  employeeId: number;
  period: string;
  category: PayrollCategory;
  amount: number;
  note?: string;
  direction?: 'earning' | 'deduction';
}

export function useCreatePayrollEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPayrollEntryInput) => apiRequest<{ id: number }>('/api/payroll', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Entry added');
    },
    onError: (err) => toast.error('Could not add entry', { description: (err as Error).message }),
  });
}

export interface RunPayrollInput {
  period: string;
  entries: { employeeId: number; grossSalary: number }[];
}

export function useRunPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RunPayrollInput) => apiRequest<{ period: string; results: { employeeId: number; employeeName: string; netSalary: number }[] }>('/api/payroll/run', { method: 'POST', body: input }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success(`Payroll run for ${data.results.length} ${data.results.length === 1 ? 'person' : 'people'}`, {
        description: data.period,
      });
    },
    onError: (err) => toast.error('Could not run payroll', { description: (err as Error).message }),
  });
}

export function useDeletePayrollEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest<{ ok: boolean }>(`/api/payroll/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Entry removed');
    },
    onError: (err) => toast.error('Could not remove entry', { description: (err as Error).message }),
  });
}
