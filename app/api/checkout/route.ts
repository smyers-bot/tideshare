import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  try {
    const body = await req.json();
    const { gearTitle, price, days, renterEmail, stripeAccountId, deliveryFee = 0, listingId = '' } = body;

    const baseAmount = Math.round(price * days * 100);
    const total = Math.round(price * days * 1.15 * 100) + Math.round(deliveryFee * 100);
    const ownerAmount = Math.round(price * days * 0.85 * 100) + Math.round(deliveryFee * 100);
    const origin = req.headers.get('origin') || 'https://tideshare.app';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      customer_email: renterEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: gearTitle,
              description: `${days} day${days !== 1 ? 's' : ''} rental · Pickup from owner`,
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking-success${listingId ? `?listing_id=${listingId}` : ''}`,
      cancel_url: `${origin}/browse`,
    };

    if (stripeAccountId) {
      sessionParams.payment_intent_data = {
        transfer_data: {
          destination: stripeAccountId,
          amount: ownerAmount,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
