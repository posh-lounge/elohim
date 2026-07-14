import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const data = await callPhpApi<{ ok: boolean }>(`/payroll/${params.id}`, { method: 'DELETE', token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to delete entry';
    return NextResponse.json({ error: message }, { status });
  }
}
