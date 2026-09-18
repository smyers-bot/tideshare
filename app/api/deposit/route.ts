import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();

  try {
    const { bookingId, action } = await req.json();
    if (!bookingId || !['release', 'claim'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify caller owns the listing
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get booking with listing info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, listing:listings(user_id, stripe_account_id)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.listing?.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (booking.deposit_status !== 'held') return NextResponse.json({ error: 'Deposit not in held state' }, { status: 400 });

    const depositCents = Math.round((booking.deposit_amount || 0) * 100);
    if (depositCents === 0) return NextResponse.json({ error: 'No deposit on this booking' }, { status: 400 });

    // Get payment intent from Stripe session
    const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
    const paymentIntentId = session.payment_intent as string;

    if (action === 'release') {
      // Refund deposit back to renter
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: depositCents,
      });
      await supabase.from('bookings').update({ deposit_status: 'released' }).eq('id', bookingId);
      return NextResponse.json({ success: true, action: 'released' });
    }

    if (action === 'claim') {
      // Transfer deposit to owner's Stripe account
      const ownerStripeId = booking.listing?.stripe_account_id;
      if (!ownerStripeId) return NextResponse.json({ error: 'Owner has no Stripe account connected' }, { status: 400 });

      await stripe.transfers.create({
        amount: depositCents,
        currency: 'usd',
        destination: ownerStripeId,
        transfer_group: bookingId,
      });
      await supabase.from('bookings').update({ deposit_status: 'claimed' }).eq('id', bookingId);
      return NextResponse.json({ success: true, action: 'claimed' });
    }
  } catch (err: any) {
    console.error('Deposit error:', err);
    return NextResponse.json({ error: err.message || 'Deposit action failed' }, { status: 500 });
  }
}
