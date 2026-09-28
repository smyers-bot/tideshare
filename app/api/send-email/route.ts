import { NextRequest, NextResponse } from 'next/server';
import { sendBookingRequestEmail, sendNewListingEmail } from '@/app/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === 'booking_request') {
      await sendBookingRequestEmail(body);
    } else if (body.type === 'new_listing') {
      await sendNewListingEmail(body);
    } else {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
