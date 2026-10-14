import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { Letter } from '@/lib/types';

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const params: Record<string, string> = {};
  const status = req.nextUrl.searchParams.get('status');
  const search = req.nextUrl.searchParams.get('search');
  if (status && status !== 'All') params.status = status;
  if (search) params.search = search;

  try {
    const data = await callPhpApi<{ letters: Letter[] }>('/letters', { token, searchParams: params });
    return NextResponse.json(data);
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const m = e instanceof Error ? e.message : 'Failed to load letters';
    return NextResponse.json({ error: m }, { status: s });
  }
}

export async function POST(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  try {
    const data = await callPhpApi<{ id: number; ref_no: string }>('/letters', {
      method: 'POST',
      token,
      body,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const m = e instanceof Error ? e.message : 'Failed to create letter';
    return NextResponse.json({ error: m }, { status: s });
  }
}