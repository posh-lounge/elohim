import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const url = `${process.env.PHP_API_URL}/employees/${params.id}/documents/${params.docId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete document');
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}