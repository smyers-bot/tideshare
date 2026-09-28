import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = await createClient();

    const { bookingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const isPaid = booking.status === 'paid' || booking.status === 'confirmed';

    if (isPaid && booking.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id, {
        expand: ['payment_intent'],
      });
      const pi = session.payment_intent as any;
      if (pi?.id) {
        await stripe.refunds.create({ payment_intent: pi.id });
      }
    }

    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    return NextResponse.json({ success: true, refunded: isPaid });
  } catch (err: any) {
    console.error('Cancel error:', err);
    return NextResponse.json({ error: err.message || 'Cancel failed' }, { status: 500 });
  }
}
