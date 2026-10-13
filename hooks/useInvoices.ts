'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/clientApi';
import type {
  Invoice,
  InvoiceDetail,
  InvoiceStatus,
  PaymentMode,
} from '@/lib/types';

const INVOICES_KEY = ['invoices'];

// ─── Queries ────────────────────────────────────────────────────────────────

export function useInvoices(filter?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filter?.status && filter.status !== 'All') params.set('status', filter.status);
  if (filter?.search) params.set('search', filter.search);
  const qs = params.toString();

  return useQuery({
    queryKey: [...INVOICES_KEY, filter?.status ?? 'All', filter?.search ?? ''],
    queryFn: () =>
      apiRequest<{ invoices: Invoice[] }>(`/api/invoices${qs ? `?${qs}` : ''}`),
  });
}

export function useInvoiceDetail(invId: string | null) {
  return useQuery({
    queryKey: ['invoice', invId],
    queryFn: () => apiRequest<InvoiceDetail>(`/api/invoices/${invId}`),
    enabled: !!invId,
  });
}

// ─── Create ─────────────────────────────────────────────────────────────────

export interface NewInvoiceInput {
  currency: string;
  clientName: string;
  clientDetails: string;
  duedate: string;
  products: { name: string; price: number; quantity: number }[];
  subTotal: number;
  vat: number;
  grandTotal: number;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewInvoiceInput) =>
      apiRequest<{ invId: string; invNo: number }>('/api/invoices', {
        method: 'POST',
        body: input,
      }),
    onSuccess: (data, input) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      toast.success('Invoice created', { description: data.invId });
    },
    onError: (err) =>
      toast.error('Could not create invoice', { description: (err as Error).message }),
  });
}

// ─── Status change ──────────────────────────────────────────────────────────

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invId, status }: { invId: string; status: InvoiceStatus }) =>
      apiRequest<{ ok: boolean }>(`/api/invoices/${invId}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: ['invoice', vars.invId] });
      toast.success(`Invoice marked as ${vars.status}`);
    },
    onError: (err) =>
      toast.error('Could not update status', { description: (err as Error).message }),
  });
}

// ─── Record payment ─────────────────────────────────────────────────────────

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invId,
      amount,
      paymentMode,
    }: {
      invId: string;
      amount: number;
      paymentMode: PaymentMode;
    }) =>
      apiRequest<{
        ok: boolean;
        newStatus: string;
        paidAmount: number;
        balanceAmount: number;
      }>(`/api/invoices/${invId}/payments`, {
        method: 'POST',
        body: { amount, paymentMode },
      }),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: ['invoice', vars.invId] });
      toast.success('Payment recorded');
    },
    onError: (err) =>
      toast.error('Payment failed', { description: (err as Error).message }),
  });
}

// ─── PDF helpers ────────────────────────────────────────────────────────────

export async function printInvoicePdf(
  invId: string,
  kind: 'invoice' | 'proforma' | 'receipt',
): Promise<void> {
  const toastId = toast.loading(`Generating ${kind}…`);
  try {
    const res = await fetch(`/api/invoices/${invId}/pdf/${kind}`, { method: 'POST' });
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
      a.download = `${kind}-${invId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    toast.success(`${kind} ready`, { id: toastId });
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    toast.error((e as Error).message, { id: toastId });
  }
}