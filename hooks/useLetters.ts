'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type { Letter, LetterDetail, LetterStatus, NewLetterInput } from '@/lib/types';

const LETTERS_KEY = ['letters'];

export function useLetters(filter?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filter?.status && filter.status !== 'All') params.set('status', filter.status);
  if (filter?.search) params.set('search', filter.search);
  const qs = params.toString();

  return useQuery({
    queryKey: [...LETTERS_KEY, filter?.status ?? 'All', filter?.search ?? ''],
    queryFn: () => apiRequest<{ letters: Letter[] }>(`/api/letters${qs ? `?${qs}` : ''}`),
  });
}

export function useLetter(id: number | null) {
  return useQuery({
    queryKey: ['letter', id],
    queryFn: () => apiRequest<LetterDetail>(`/api/letters/${id}`),
    enabled: !!id,
  });
}

export function useCreateLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewLetterInput) =>
      apiRequest<{ id: number; ref_no: string }>('/api/letters', { method: 'POST', body: input }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LETTERS_KEY });
      toast.success('Letter created', { description: data.ref_no });
    },
    onError: (err) => toast.error('Could not create letter', { description: (err as Error).message }),
  });
}

export function useUpdateLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<NewLetterInput>) =>
      apiRequest<{ ok: boolean }>(`/api/letters/${id}`, { method: 'PATCH', body: patch }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LETTERS_KEY });
      qc.invalidateQueries({ queryKey: ['letter', vars.id] });
      toast.success('Letter saved');
    },
    onError: (err) => toast.error('Save failed', { description: (err as Error).message }),
  });
}

export function useUpdateLetterStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: LetterStatus }) =>
      apiRequest<{ ok: boolean }>(`/api/letters/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LETTERS_KEY });
      qc.invalidateQueries({ queryKey: ['letter', vars.id] });
      toast.success(`Letter marked as ${vars.status}`);
    },
    onError: (err) => toast.error('Update failed', { description: (err as Error).message }),
  });
}

export function useDeleteLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest<{ ok: boolean }>(`/api/letters/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LETTERS_KEY });
      toast.success('Letter deleted');
    },
    onError: (err) => toast.error('Delete failed', { description: (err as Error).message }),
  });
}

export async function printLetterPdf(id: number): Promise<void> {
  const toastId = toast.loading('Generating letter PDF…');
  try {
    const res = await fetch(`/api/letters/${id}/pdf`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const tab = window.open(url, '_blank');
    if (!tab) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `letter-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    toast.success('Letter ready', { id: toastId });
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    toast.error((e as Error).message, { id: toastId });
  }
}