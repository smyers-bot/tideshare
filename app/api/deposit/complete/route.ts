import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { depositSessionId, bookingId } = await req.json();
    if (!depositSessionId || !bookingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('renter_id')
      .eq('id', bookingId)
      .single();
    if (!booking || booking.renter_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const session = await stripe.checkout.sessions.retrieve(depositSessionId, {
      expand: ['payment_intent'],
    });

    // The session must actually belong to this booking, not just any session id the caller supplies.
    if (session.metadata?.booking_id !== bookingId) {
      return NextResponse.json({ error: 'Session does not match booking' }, { status: 400 });
    }

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    if (!paymentIntent?.id || paymentIntent.status !== 'requires_capture') {
      return NextResponse.json({ error: 'Deposit hold was not successfully authorized' }, { status: 400 });
    }

    await supabase.from('bookings').update({
      deposit_payment_intent_id: paymentIntent.id,
      deposit_status: 'authorized',
    }).eq('id', bookingId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Deposit complete error:', err);
    return NextResponse.json({ error: err.message || 'Failed to record deposit hold' }, { status: 500 });
  }
}
