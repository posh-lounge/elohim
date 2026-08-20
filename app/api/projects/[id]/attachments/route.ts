// app/api/projects/[id]/attachments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const formData = await req.formData();
  
  try {
    const url = `https://elohim.giafirst.com/backend/public/projects/${params.id}/attachments`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload');
    
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to upload file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const attachmentId = searchParams.get('attachmentId');
  
  if (!attachmentId) {
    return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 });
  }

  try {
    const url = `${process.env.PHP_API_URL}/projects/${params.id}/attachments/${attachmentId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete');
    
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}