import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('account_id');
  if (!accountId) return NextResponse.redirect(new URL('/dashboard', req.url));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/auth/signin', req.url));

  // Save to user metadata so it persists even before any listings exist
  await supabase.auth.updateUser({ data: { stripe_account_id: accountId } });

  // Also update any existing listings
  await supabase
    .from('listings')
    .update({ stripe_account_id: accountId })
    .eq('user_id', user.id);

  return NextResponse.redirect(new URL('/dashboard?stripe=connected', req.url));
}
