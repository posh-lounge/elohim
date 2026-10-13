import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function POST(
  req: NextRequest,
  { params }: { params: { invId: string } },
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const { amount, paymentMode } = body;

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }
  if (!paymentMode) {
    return NextResponse.json({ error: 'paymentMode is required' }, { status: 400 });
  }

  try {
    const data = await callPhpApi<{
      ok: boolean;
      newStatus: string;
      paidAmount: number;
      balanceAmount: number;
    }>(`/invoices/${params.invId}/payments`, {
      method: 'POST',
      token,
      body: { amount, paymentMode },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to record payment';
    return NextResponse.json({ error: message }, { status: s });
  }
}