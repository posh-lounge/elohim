import { NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { SessionUser } from '@/lib/types';

export async function GET() {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const user = await callPhpApi<SessionUser>('/auth/me', { token });
    return NextResponse.json({ user });
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    return NextResponse.json({ error: 'Session invalid' }, { status });
  }
}
