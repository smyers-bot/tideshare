import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';
import { sendBookingApprovedEmail } from '@/app/lib/email';

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, listing:listings(title, price, user_id, stripe_account_id, deposit_amount, owner_name)')
      .eq('id', bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.listing?.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const stripeAccountId = booking.listing?.stripe_account_id;
    if (!stripeAccountId) return NextResponse.json({ error: 'Connect Stripe before accepting bookings' }, { status: 400 });

    const origin = req.headers.get('origin') || 'https://www.tideshare.app';
    const days = booking.days || 1;
    const price = booking.listing?.price || 0;
    const rentalTotal = Math.round(price * days * 1.15 * 100);
    const ownerAmount = Math.round(price * days * 0.85 * 100);
    const depositAmount = booking.listing?.deposit_amount || 0;

    const successParams = new URLSearchParams({ booking_id: bookingId, listing_id: booking.listing_id || '' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: booking.renter_email,
      customer_creation: 'always',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: booking.listing?.title || 'Gear rental', description: `${days} day${days !== 1 ? 's' : ''} · ${booking.start_date || ''}–${booking.end_date || ''}` },
          unit_amount: rentalTotal,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/booking-success?${successParams.toString()}`,
      cancel_url: `${origin}/browse`,
      payment_intent_data: {
        transfer_data: { destination: stripeAccountId, amount: ownerAmount },
        // Save the card so we can auto-authorize the deposit after payment
        setup_future_usage: depositAmount > 0 ? 'off_session' : undefined,
      },
      // Pass booking context to the webhook
      metadata: {
        booking_id: bookingId,
        deposit_amount: depositAmount > 0 ? String(depositAmount) : '0',
        owner_stripe_account_id: stripeAccountId,
      },
    });

    await supabase.from('bookings').update({
      status: 'approved',
      stripe_session_id: session.id,
      deposit_status: depositAmount > 0 ? 'pending_auth' : 'none',
    }).eq('id', bookingId);

    // Email renter their payment link
    if (booking.renter_email && session.url) {
      try {
        await sendBookingApprovedEmail({
          renterEmail: booking.renter_email,
          renterName: booking.renter_name || 'there',
          ownerName: booking.listing?.owner_name || 'The owner',
          gearTitle: booking.listing?.title || 'gear',
          paymentUrl: session.url,
          startDate: booking.start_date || '',
          endDate: booking.end_date || '',
          total: Math.round(rentalTotal / 100),
        });
      } catch (emailErr) {
        console.error('Approval email failed (non-fatal):', emailErr);
      }
    }

    return NextResponse.json({ paymentUrl: session.url });
  } catch (err: any) {
    console.error('Approve error:', err);
    return NextResponse.json({ error: err.message || 'Failed to approve booking' }, { status: 500 });
  }
}
