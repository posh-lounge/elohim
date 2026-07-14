import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { SESSION_COOKIE } from '@/lib/session';
import type { SessionUser } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const data = await callPhpApi<{ token: string; user: SessionUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    const res = NextResponse.json({ user: data.user });
    res.cookies.set(SESSION_COOKIE, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // matches backend token TTL
    });
    return res;
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Login failed';
    return NextResponse.json({ error: message }, { status });
  }
}
