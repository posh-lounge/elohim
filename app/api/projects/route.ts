// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const scope = searchParams.get('scope') || 'my';
  const status = searchParams.get('status') || '';

  try {
    const data = await callPhpApi<{ projects: any[] }>('/projects', {
      method: 'GET',
      token,
      searchParams: { scope, status },
    });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to fetch projects';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  try {
    const data = await callPhpApi<{ id: number; project_key: string }>('/projects', {
      method: 'POST',
      token,
      body,
    });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to create project';
    return NextResponse.json({ error: message }, { status });
  }
}