import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: { roleKey: string; kind: string } }) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const body = await req.json();

  try {
    const data = await callPhpApi<{ id: number; text: string }>(
      `/roles/${params.roleKey}/${params.kind}`, { method: 'POST', token, body }
    );
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to add item';
    return NextResponse.json({ error: message }, { status });
  }
}
