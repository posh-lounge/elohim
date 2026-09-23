import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const url = `${process.env.PHP_API_URL}/employees/${params.id}/documents`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to load documents');
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load documents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const formData = await req.formData();
  
  try {
    const url = `${process.env.PHP_API_URL}/employees/${params.id}/documents`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload document');
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to upload document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}