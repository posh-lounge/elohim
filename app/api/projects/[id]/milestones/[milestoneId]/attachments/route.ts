// app/api/milestones/[id]/attachments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

export async function POST(
  req: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const formData = await req.formData();
  
  try {
    const url = `https://elohim.giafirst.com/backend/public/milestones/${params.milestoneId}/attachments`;
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