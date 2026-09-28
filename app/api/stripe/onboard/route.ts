import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check user metadata first, then fall back to listings
    let accountId = user.user_metadata?.stripe_account_id || '';

    if (!accountId) {
      const { data: listings } = await supabase
        .from('listings')
        .select('stripe_account_id')
        .eq('user_id', user.id)
        .not('stripe_account_id', 'is', null)
        .neq('stripe_account_id', '')
        .limit(1);
      accountId = listings?.[0]?.stripe_account_id || '';
    }

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { user_id: user.id },
      });
      accountId = account.id;
    }

    const origin = req.headers.get('origin') || 'https://www.tideshare.app';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard?stripe=refresh`,
      return_url: `${origin}/api/stripe/callback?account_id=${accountId}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('Stripe onboard error:', err?.message);
    return NextResponse.json({ error: err?.message || 'Stripe error' }, { status: 500 });
  }
}
