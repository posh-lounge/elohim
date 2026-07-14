import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: { roleKey: string; kind: string; id: string } }) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const body = await req.json();

  try {
    const data = await callPhpApi<{ ok: boolean }>(
      `/roles/${params.roleKey}/${params.kind}/${params.id}`, { method: 'PATCH', token, body }
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to update item';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { roleKey: string; kind: string; id: string } }) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const data = await callPhpApi<{ ok: boolean }>(
      `/roles/${params.roleKey}/${params.kind}/${params.id}`, { method: 'DELETE', token }
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to delete item';
    return NextResponse.json({ error: message }, { status });
  }
}
