import { NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { ActivityEntry } from '@/lib/types';

export async function GET() {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const data = await callPhpApi<{ entries: ActivityEntry[] }>('/activity', { token, searchParams: { limit: '150' } });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load activity log';
    return NextResponse.json({ error: message }, { status });
  }
}
