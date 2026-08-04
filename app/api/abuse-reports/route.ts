import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const data = await callPhpApi<{ reports: any[] }>('/abuse-reports', { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to fetch abuse reports';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const body = await req.json();

  try {
    const data = await callPhpApi<{ id: number }>('/abuse-reports', { method: 'POST', token, body });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to submit abuse report';
    return NextResponse.json({ error: message }, { status });
  }
}