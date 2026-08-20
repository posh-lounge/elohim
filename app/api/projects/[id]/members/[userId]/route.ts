// app/api/projects/[id]/members/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';
import { getSessionToken } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  try {
    const data = await callPhpApi<{ ok: boolean }>(
      `/projects/${params.id}/members/${params.userId}`,
      {
        method: 'PATCH',
        token,
        body,
      }
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to update member';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const data = await callPhpApi<{ ok: boolean }>(
      `/projects/${params.id}/members/${params.userId}`,
      {
        method: 'DELETE',
        token,
      }
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Failed to remove member';
    return NextResponse.json({ error: message }, { status });
  }
}