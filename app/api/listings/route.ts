import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();

  const { data: listings, error } = await admin
    .from('listings')
    .select('id, title, category, location, price, description, availability, photo_url, owner_name, emoji, deposit_amount, fulfillment_type, delivery_radius, delivery_fee, is_active, created_at')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: reviews } = await admin
    .from('reviews')
    .select('listing_id, rating');

  const statsByListing = new Map<string, { sum: number; count: number }>();
  for (const r of reviews || []) {
    const stat = statsByListing.get(r.listing_id) || { sum: 0, count: 0 };
    stat.sum += r.rating;
    stat.count += 1;
    statsByListing.set(r.listing_id, stat);
  }

  const enriched = (listings || []).map(listing => {
    const stat = statsByListing.get(listing.id);
    return {
      ...listing,
      rating: stat ? Math.round((stat.sum / stat.count) * 10) / 10 : null,
      reviews_count: stat ? stat.count : 0,
    };
  });

  return NextResponse.json({ listings: enriched });
}
