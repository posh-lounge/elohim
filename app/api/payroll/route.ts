import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { PayrollEntry } from '@/lib/types';

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const searchParams: Record<string, string> = {};
  const employeeId = req.nextUrl.searchParams.get('employeeId');
  const period = req.nextUrl.searchParams.get('period');
  if (employeeId) searchParams.employeeId = employeeId;
  if (period) searchParams.period = period;

  try {
    const data = await callPhpApi<{ entries: PayrollEntry[] }>('/payroll', { token, searchParams });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load payroll';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const body = await req.json();

  try {
    const data = await callPhpApi<{ id: number; direction: string }>('/payroll', { method: 'POST', token, body });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to add payroll entry';
    return NextResponse.json({ error: message }, { status });
  }
}
