import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

const ENDPOINT: Record<string, string> = {
  invoice:  'invoice',
  proforma: 'proforma',
  receipt:  'receipt',
};

export async function POST(
  _req: NextRequest,
  { params }: { params: { invId: string; kind: string } },
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const kind = params.kind;
  if (!ENDPOINT[kind]) {
    return NextResponse.json({ error: 'Invalid PDF kind' }, { status: 400 });
  }

  const res = await fetch(`${process.env.PHP_API_URL}/invoices/pdf/${ENDPOINT[kind]}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ invId: params.invId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.error || 'PDF generation failed' },
      { status: res.status },
    );
  }

  const pdf = await res.arrayBuffer();
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${kind}-${params.invId}.pdf"`,
      'Content-Length': String(pdf.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}