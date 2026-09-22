import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const origin = req.headers.get('origin') || 'https://tideshare.app';

  try {
    const { bookingId, listingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

    const { data: booking } = await supabase
      .from('bookings')
      .select('deposit_amount, renter_email')
      .eq('id', bookingId)
      .single();

    if (!booking || !booking.deposit_amount) {
      return NextResponse.json({ error: 'No deposit on this booking' }, { status: 400 });
    }

    const depositCents = Math.round(booking.deposit_amount * 100);

    const successParams = new URLSearchParams();
    if (listingId) successParams.set('listing_id', listingId);
    successParams.set('booking_id', bookingId);
    successParams.set('deposit_session_id', '{CHECKOUT_SESSION_ID}');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: booking.renter_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Security deposit — $${booking.deposit_amount} authorization hold`,
              description: 'A temporary hold on your card. Not charged unless damage is reported. Released automatically when the owner confirms gear was returned undamaged.',
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual',
      },
      success_url: `${origin}/booking-success?${successParams.toString()}`,
      cancel_url: `${origin}/booking-success?listing_id=${listingId}&booking_id=${bookingId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Deposit authorize error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create deposit hold' }, { status: 500 });
  }
}
