import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin?next=/dashboard');

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const listingIds = listings?.map(l => l.id) || [];
  const { data: bookings } = listingIds.length > 0
    ? await supabase
        .from('bookings')
        .select('*, listing:listing_id(title, location, price)')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';
  const stripeAccountId = user.user_metadata?.stripe_account_id || '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <DashboardClient
        user={{ id: user.id, email: user.email!, displayName, stripeAccountId }}
        listings={listings || []}
        bookings={bookings || []}
      />
    </div>
  );
}
