import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, renter_name, renter_email, renter_phone, start_date, end_date, days, total_price, message } = body;

    if (!listing_id || !renter_name || !renter_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // renter_id comes from the authenticated session, never the request body — otherwise
    // any caller could create a booking that impersonates another user's renter_id.
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    const renter_id = user?.id || null;

    const supabase = createAdminClient();
    const { data, error } = await supabase.from('bookings').insert({
      listing_id,
      renter_id,
      renter_name,
      renter_email,
      renter_phone: renter_phone || '',
      start_date: start_date || null,
      end_date: end_date || null,
      days: days || 1,
      total_price: total_price || 0,
      message: message || '',
      status: 'pending_approval',
    }).select('id').single();

    if (error || !data) {
      console.error('Booking insert error:', error?.message);
      return NextResponse.json({ error: error?.message || 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ bookingId: data.id });
  } catch (err: any) {
    console.error('Bookings route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { bookingId, action } = await req.json();
    if (!bookingId || action !== 'complete') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: booking } = await admin
      .from('bookings')
      .select('*, listing:listings(user_id)')
      .eq('id', bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.listing?.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (!['confirmed', 'paid'].includes(booking.status)) {
      return NextResponse.json({ error: 'Only a paid booking can be marked completed' }, { status: 400 });
    }

    const { error } = await admin.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update booking' }, { status: 500 });
  }
}
