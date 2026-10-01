import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/app/lib/supabase/admin';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // A manual-capture PaymentIntent gets canceled either because we voided it
  // ourselves (release/skip — deposit_status is already updated synchronously
  // in that request) or because Stripe auto-expired an untouched hold after
  // ~7 days. Only the second case needs this handler to do anything.
  if (event.type === 'payment_intent.canceled') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, deposit_status')
      .eq('deposit_payment_intent_id', pi.id)
      .single();

    if (booking && booking.deposit_status === 'authorized') {
      await supabase.from('bookings').update({ deposit_status: 'expired' }).eq('id', booking.id);
      console.log(`Deposit hold ${pi.id} auto-expired for booking ${booking.id}`);
    }
    return NextResponse.json({ received: true });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.booking_id;
  const depositAmount = parseFloat(session.metadata?.deposit_amount || '0');

  // Only rental-payment sessions carry booking_id in metadata (the deposit-only
  // checkout in /api/deposit/authorize does not), so this never double-fires.
  if (!bookingId || session.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  // Mark the booking paid regardless of whether it also has a deposit — this was
  // previously only done as a side effect of the deposit-hold branch below, so any
  // booking without a deposit never left 'approved' even after payment succeeded.
  await supabase.from('bookings').update({ status: 'paid' }).eq('id', bookingId);

  if (depositAmount <= 0) {
    return NextResponse.json({ received: true });
  }

  try {
    // Get the payment method from the completed payment intent
    const paymentIntentId = session.payment_intent as string;
    if (!paymentIntentId) return NextResponse.json({ received: true });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paymentMethodId = paymentIntent.payment_method as string;
    const customerId = (paymentIntent.customer || session.customer) as string;

    if (!paymentMethodId || !customerId) {
      console.error('No payment method or customer on completed session', session.id);
      await supabase.from('bookings').update({ deposit_status: 'failed' }).eq('id', bookingId);
      return NextResponse.json({ received: true });
    }

    // Create a deposit authorization hold (manual capture = hold, not a charge)
    const depositCents = Math.round(depositAmount * 100);
    const depositIntent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      capture_method: 'manual',
      off_session: true,
      description: `Security deposit — refundable hold for booking ${bookingId}`,
      metadata: { booking_id: bookingId, type: 'deposit_hold' },
    });

    await supabase.from('bookings').update({
      deposit_payment_intent_id: depositIntent.id,
      deposit_status: depositIntent.status === 'requires_capture' ? 'authorized' : 'failed',
    }).eq('id', bookingId);

    console.log(`Deposit hold ${depositIntent.id} created for booking ${bookingId} — status: ${depositIntent.status}`);
  } catch (err: any) {
    console.error('Deposit auto-authorize failed:', err.message);
    // Non-fatal: rental payment already succeeded, mark deposit as failed so owner can see
    await supabase.from('bookings').update({ deposit_status: 'failed' }).eq('id', bookingId);
  }

  return NextResponse.json({ received: true });
}
