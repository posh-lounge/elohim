import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { Task } from '@/lib/types';

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const scope = req.nextUrl.searchParams.get('scope') ?? 'my';

  try {
    const data = await callPhpApi<{ tasks: Task[] }>('/tasks', { token, searchParams: { scope } });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load tasks';
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
    const data = await callPhpApi<{ id: number }>('/tasks', { method: 'POST', token, body });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to create task';
    return NextResponse.json({ error: message }, { status });
  }
}
