import { NextRequest, NextResponse } from 'next/server';
import { sendFeedbackNotification } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, email } = body;

    if (!type || !title || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await sendFeedbackNotification({ type, title, description, email });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AethLife] Feedback email error:', error);
    // Never fail the user request over email issues
    return NextResponse.json({ success: true });
  }
}
