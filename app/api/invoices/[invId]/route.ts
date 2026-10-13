import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { InvoiceDetail } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { invId: string } },
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const data = await callPhpApi<InvoiceDetail>(`/invoices/${params.invId}`, { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load invoice';
    return NextResponse.json({ error: message }, { status });
  }
}