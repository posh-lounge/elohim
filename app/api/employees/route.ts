import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { Employee, PaginatedEnvelope } from '@/lib/types';

export interface EmployeesPage extends PaginatedEnvelope {
  employees: Employee[];
}

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const role = req.nextUrl.searchParams.get('role');

  try {
    const searchParams: Record<string, string> = role
      ? { role }
      : { page: req.nextUrl.searchParams.get('page') ?? '1', limit: req.nextUrl.searchParams.get('limit') ?? '25' };
    const data = await callPhpApi<EmployeesPage>('/employees', { token, searchParams });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load employees';
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
    const data = await callPhpApi<{ id: number }>('/employees', { method: 'POST', token, body });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to create employee';
    return NextResponse.json({ error: message }, { status });
  }
}
