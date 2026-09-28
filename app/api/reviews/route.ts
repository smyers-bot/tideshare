import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listing_id = searchParams.get('listing_id');
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

  // Use admin client so RLS doesn't block public review reads
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('reviews')
    .select('*')
    .eq('listing_id', listing_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const { listing_id, reviewer_name, reviewer_id, rating, comment } = await req.json();
    if (!listing_id || !reviewer_name || !rating || !reviewer_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Server-side enforcement: reviewer must have a completed booking for this listing.
    const { data: bookings } = await admin
      .from('bookings')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('renter_id', reviewer_id)
      .eq('status', 'completed')
      .limit(1);

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'Reviews are only allowed after a completed rental.' }, { status: 403 });
    }

    const { error } = await admin.from('reviews').insert({
      listing_id,
      reviewer_name,
      reviewer_id,
      rating,
      comment: comment || '',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
