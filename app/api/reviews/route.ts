import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listing_id = searchParams.get('listing_id');
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
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
    if (!listing_id || !reviewer_name || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const supabase = await createClient();
    const { error } = await supabase.from('reviews').insert({
      listing_id,
      reviewer_name,
      reviewer_id: reviewer_id || null,
      rating,
      comment: comment || '',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
