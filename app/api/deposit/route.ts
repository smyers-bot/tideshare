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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, listing:listings(user_id, stripe_account_id)')
      .eq('id', bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.listing?.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (booking.deposit_status !== 'authorized') {
      return NextResponse.json({ error: 'Deposit is not in an authorized state' }, { status: 400 });
    }

    const depositPiId = booking.deposit_payment_intent_id;
    if (!depositPiId) {
      return NextResponse.json({ error: 'No deposit authorization found for this booking' }, { status: 400 });
    }

    const depositCents = Math.round((booking.deposit_amount || 0) * 100);

    if (action === 'release') {
      // Void the authorization hold — renter never sees a charge
      await stripe.paymentIntents.cancel(depositPiId);
      await supabase.from('bookings').update({ deposit_status: 'released' }).eq('id', bookingId);
      return NextResponse.json({ success: true, action: 'released' });
    }

    if (action === 'claim') {
      // Capture the hold (now actually charges the renter), then transfer to owner
      await stripe.paymentIntents.capture(depositPiId, { amount_to_capture: depositCents });

      const ownerStripeId = booking.listing?.stripe_account_id;
      if (ownerStripeId) {
        await stripe.transfers.create({
          amount: depositCents,
          currency: 'usd',
          destination: ownerStripeId,
          transfer_group: bookingId,
        });
      }

      await supabase.from('bookings').update({ deposit_status: 'claimed' }).eq('id', bookingId);
      return NextResponse.json({ success: true, action: 'claimed' });
    }
  } catch (err: any) {
    console.error('Deposit error:', err);
    return NextResponse.json({ error: err.message || 'Deposit action failed' }, { status: 500 });
  }
}
