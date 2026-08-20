import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { callPhpApi, PhpApiError } from '@/lib/serverApi';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();

  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const data = await callPhpApi(
      `/projects/${params.id}/attachments`,
      {
        method: 'POST',
        token,
        body: formData,
      }
    );

    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message =
      e instanceof Error ? e.message : 'Failed to upload file';

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getSessionToken();

  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const attachmentId = req.nextUrl.searchParams.get('attachmentId');

  if (!attachmentId) {
    return NextResponse.json(
      { error: 'Attachment ID required' },
      { status: 400 }
    );
  }

  try {
    const data = await callPhpApi(
      `/projects/${params.id}/attachments/${attachmentId}`,
      {
        method: 'DELETE',
        token,
      }
    );

    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof PhpApiError ? e.status : 500;
    const message =
      e instanceof Error ? e.message : 'Failed to delete file';

    return NextResponse.json({ error: message }, { status });
  }
}