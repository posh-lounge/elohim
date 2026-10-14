import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';
import type { LetterStatus } from '@/lib/types';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { status } = (await req.json()) as { status: LetterStatus };
  try {
    const data = await callPhpApi<{ ok: boolean }>(`/letters/${params.id}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    });
    return NextResponse.json(data);
  } catch (e) {
    const s = e instanceof PhpApiError ? e.status : 500;
    const m = e instanceof Error ? e.message : 'Failed to update status';
    return NextResponse.json({ error: m }, { status: s });
  }
}