'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { Employee, EmploymentType, EmployeeDocument } from '@/lib/types';
import type { EmployeesPage } from '@/app/api/employees/route';

const EMPLOYEES_KEY = ['employees'];
const PAGE_SIZE = 25;

// ─── Query hooks ────────────────────────────────────────────────────────────

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

// ─── Create ─────────────────────────────────────────────────────────────────

export interface NewEmployeeInput {
  name: string;
  position: string;
  department: string;
  employmentType: EmploymentType;

  phone?: string;
  email?: string;
  hireDate?: string;
  notes?: string;

  dateOfBirth?: string;
  nationalId?: string;
  address?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  bankName?: string;
  bankAccount?: string;
  tinNumber?: string;
  socialSecurityNumber?: string;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewEmployeeInput) =>
      apiRequest<{ id: number }>('/api/employees', { method: 'POST', body: input }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      queryClient.invalidateQueries({ queryKey: ['employees-all-for-picker'] });
      toast.success('Employee added', { description: input.name });
    },
    onError: (err) => toast.error('Could not add employee', { description: (err as Error).message }),
  });
}

// ─── Update ─────────────────────────────────────────────────────────────────

export interface UpdateEmployeeInput {
  id: number;
  employmentType?: EmploymentType;
  isActive?: boolean;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  position?: string;
  department?: string;
  baseSalary?: number;

  dateOfBirth?: string | null;
  nationalId?: string | null;
  address?: string | null;
  residenceLocation?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;

  bankName?: string | null;
  bankAccount?: string | null;
  tinNumber?: string | null;
  socialSecurityNumber?: string | null;

  fatherName?: string | null;
  fatherOccupation?: string | null;
  fatherPhone?: string | null;
  motherName?: string | null;
  motherOccupation?: string | null;
  motherPhone?: string | null;
  maritalStatus?: string | null;
  numberOfChildren?: number | null;

  educationLevel?: string | null;
  fieldOfStudy?: string | null;
  previousEmployer?: string | null;
  previousPosition?: string | null;
  yearsOfExperience?: number | null;
  skillsSummary?: string | null;
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateEmployeeInput) => {
      // Drop only `undefined`. Empty strings / null are kept so a field can be cleared
      // (the PHP side converts '' to NULL).
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        cleaned[key] = value;
      }
      if (Object.keys(cleaned).length === 0) {
        throw new Error('No changes to save');
      }
      return apiRequest<{ ok: boolean }>(`/api/employees/${id}`, {
        method: 'PATCH',
        body: cleaned,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      queryClient.invalidateQueries({ queryKey: ['employees-all-for-picker'] });
      toast.success('Employee updated');
    },
    onError: (err) =>
      toast.error('Could not update employee', {
        description: (err as Error).message,
      }),
  });
}

// ─── Documents ──────────────────────────────────────────────────────────────

export function useEmployeeDocuments(employeeId: number) {
  return useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: () => apiRequest<{ documents: EmployeeDocument[] }>(`/api/employees/${employeeId}/documents`),
    enabled: !!employeeId,
  });
}

export function useUploadEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      file,
      documentType,
      description,
    }: {
      employeeId: number;
      file: File;
      documentType: string;
      description?: string;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      if (description) formData.append('description', description);

      return fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload');
        return data;
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', vars.employeeId] });
      toast.success('Document uploaded');
    },
    onError: (err) => toast.error('Upload failed', { description: (err as Error).message }),
  });
}

export function useDeleteEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, documentId }: { employeeId: number; documentId: number }) =>
      apiRequest(`/api/employees/${employeeId}/documents/${documentId}`, { method: 'DELETE' }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', vars.employeeId] });
      toast.success('Document deleted');
    },
    onError: (err) => toast.error('Delete failed', { description: (err as Error).message }),
  });
}

// ─── Profile photo ──────────────────────────────────────────────────────────

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: number; file: File }) => {
      const formData = new FormData();
      formData.append('photo', file);

      return fetch(`/api/employees/${employeeId}/profile-photo`, {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload');
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Profile photo updated');
    },
    onError: (err) => toast.error('Upload failed', { description: (err as Error).message }),
  });
}