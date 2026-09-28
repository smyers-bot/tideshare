import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('account_id');
  if (!accountId) return NextResponse.redirect(new URL('/dashboard', req.url));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/auth/signin', req.url));

  // account_id arrives via URL query param, so verify it was actually created for this
  // user before wiring it up as their payout destination — otherwise a crafted link
  // with someone else's account id would silently redirect this user's future payouts.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const account = await stripe.accounts.retrieve(accountId);
  if (account.metadata?.user_id !== user.id) {
    return NextResponse.redirect(new URL('/dashboard?stripe=error', req.url));
  }

  // Save to user metadata so it persists even before any listings exist
  await supabase.auth.updateUser({ data: { stripe_account_id: accountId } });

  // Also update any existing listings
  await supabase
    .from('listings')
    .update({ stripe_account_id: accountId })
    .eq('user_id', user.id);

  return NextResponse.redirect(new URL('/dashboard?stripe=connected', req.url));
}
