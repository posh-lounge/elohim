import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { InvoiceStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { invId: string } },
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { status } = (await req.json()) as { status: InvoiceStatus };
  if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 });

  try {
    const data = await callPhpApi<{ ok: boolean }>(`/invoices/${params.invId}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    });
    return NextResponse.json(data);
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to update status';
    return NextResponse.json({ error: message }, { status: s });
  }
}