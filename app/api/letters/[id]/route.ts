import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { LetterDetail } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const data = await callPhpApi<LetterDetail>(`/letters/${params.id}`, { token });
    return NextResponse.json(data);
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const m = e instanceof Error ? e.message : 'Failed to load letter';
    return NextResponse.json({ error: m }, { status: s });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  try {
    const data = await callPhpApi<{ ok: boolean }>(`/letters/${params.id}`, {
      method: 'PATCH',
      token,
      body,
    });
    return NextResponse.json(data);
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const m = e instanceof Error ? e.message : 'Failed to update letter';
    return NextResponse.json({ error: m }, { status: s });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const data = await callPhpApi<{ ok: boolean }>(`/letters/${params.id}`, {
      method: 'DELETE',
      token,
    });
    return NextResponse.json(data);
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const m = e instanceof Error ? e.message : 'Failed to delete letter';
    return NextResponse.json({ error: m }, { status: s });
  }
}