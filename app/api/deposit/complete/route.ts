import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();

  try {
    const { depositSessionId, bookingId } = await req.json();
    if (!depositSessionId || !bookingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(depositSessionId);
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No payment intent found on session' }, { status: 400 });
    }

    await supabase.from('bookings').update({
      deposit_payment_intent_id: paymentIntentId,
      deposit_status: 'authorized',
    }).eq('id', bookingId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Deposit complete error:', err);
    return NextResponse.json({ error: err.message || 'Failed to record deposit hold' }, { status: 500 });
  }
}
