import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { ActivityEntry } from '@/lib/types';

export interface ActivityPage {
  entries: ActivityEntry[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export async function GET(req: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const page = req.nextUrl.searchParams.get('page') ?? '1';
  const limit = req.nextUrl.searchParams.get('limit') ?? '25';

  try {
    const data = await callPhpApi<ActivityPage>('/activity', { token, searchParams: { page, limit } });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to load activity log';
    return NextResponse.json({ error: message }, { status });
  }
}
