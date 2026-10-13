import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { Invoice } from '@/lib/types';

export interface InvoicesListResponse {
  invoices: Invoice[];
}

// GET /api/invoices?status=Unpaid&search=...
export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const params: Record<string, string> = {};
  const status = req.nextUrl.searchParams.get('status');
  const search = req.nextUrl.searchParams.get('search');
  if (status && status !== 'All') params.status = status;
  if (search) params.search = search;

  try {
    const data = await callPhpApi<InvoicesListResponse>('/invoices', { token, searchParams: params });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load invoices';
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/invoices — create
export async function POST(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();

  try {
    const data = await callPhpApi<{ id: number; invId: string }>('/invoices', {
      method: 'POST',
      token,
      body,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to create invoice';
    return NextResponse.json({ error: message }, { status });
  }
}