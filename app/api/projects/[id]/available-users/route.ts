// app/api/projects/[id]/available-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search') || '';

  try {
    const data = await callPhpApi<{ users: any[] }>(
      `/projects/${params.id}/available-users`,
      {
        method: 'GET',
        token,
        searchParams: { search },
      }
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to fetch available users';
    return NextResponse.json({ error: message }, { status });
  }
}