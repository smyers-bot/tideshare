'use client';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

type Listing = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  photo_url: string;
  emoji: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  stripe_account_id: string;
};

type Booking = {
  id: string;
  listing_id: string;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
  start_date: string;
  end_date: string;
  days: number;
  total_price: number;
  deposit_amount: number;
  deposit_status: string;
  stripe_session_id: string;
  status: string;
  message: string;
  created_at: string;
  listing: { title: string; location: string; price: number } | null;
};

type Props = {
  user: { id: string; email: string; displayName: string };
  listings: Listing[];
  bookings: Booking[];
};

const CATEGORY_EMOJI: Record<string, string> = {
  Surfboards: '🏄', Kayaks: '🚣', Paddleboards: '🏄‍♀️', 'Golf Clubs': '⛳',
  'Beach Chairs': '🏖️', Bikes: '🚲', 'Fishing Gear': '🎣', 'Camping Gear': '⛺',
  Bundles: '🎉', Other: '📦',
};

export default function DashboardClient({ user, listings: initialListings, bookings: initialBookings }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [depositAction, setDepositAction] = useState<string | null>(null);
  const supabase = createClient();

  const stripeConnected = listings.some(l => l.stripe_account_id);

  const connectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/onboard', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Could not connect Stripe. Try again.');
    } finally {
      setConnectingStripe(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('listings').delete().eq('id', id);
    setListings(l => l.filter(x => x.id !== id));
    setDeleting(null);
  };

  const toggleActive = async (id: string, current: boolean) => {
    setToggling(id);
    await supabase.from('listings').update({ is_active: !current }).eq('id', id);
    setListings(l => l.map(x => x.id === id ? { ...x, is_active: !current } : x));
    setToggling(null);
  };

  const handleDeposit = async (bookingId: string, action: 'release' | 'claim') => {
    const label = action === 'release' ? 'refund the deposit to the renter' : 'claim the deposit for damage';
    if (!confirm(`Are you sure you want to ${label}? This cannot be undone.`)) return;
    setDepositAction(bookingId + action);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, deposit_status: action === 'release' ? 'released' : 'claimed' } : b));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDepositAction(null);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'pending_payment');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid');

  const pill = (label: string, color: string, bg: string) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: bg, color, letterSpacing: '0.04em' }}>{label}</span>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.3px' }}>
            Hey {user.displayName} 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
        <Link href="/list" style={{ background: 'var(--ocean)', color: '#fff', padding: '11px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
          + List new gear
        </Link>
      </div>

      {/* Stripe connect banner */}
      <div style={{ background: stripeConnected ? '#E6F4ED' : 'var(--surface)', border: `1px solid ${stripeConnected ? '#A7D9BA' : 'var(--border)'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{stripeConnected ? '✅' : '💳'}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              {stripeConnected ? 'Stripe connected — payouts are automatic' : 'Connect Stripe to receive payouts automatically'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {stripeConnected ? '85% of each booking deposits directly to your bank account.' : 'Takes 5 minutes. 85% of bookings deposit straight to your bank.'}
            </p>
          </div>
        </div>
        {!stripeConnected && (
          <button
            onClick={connectStripe}
            disabled={connectingStripe}
            style={{ background: 'var(--ocean)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            {connectingStripe ? 'Connecting...' : 'Connect Stripe →'}
          </button>
        )}
      </div>

      {/* Stats row */}
      {listings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Active listings', value: listings.filter(l => l.is_active && l.is_approved).length },
            { label: 'Pending review', value: listings.filter(l => !l.is_approved).length },
            { label: 'Booking requests', value: pendingBookings.length },
            { label: 'Confirmed bookings', value: confirmedBookings.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ocean)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your listings</h2>

        {listings.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏄</div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No listings yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>List your first piece of gear and start earning.</p>
            <Link href="/list" style={{ background: 'var(--ocean)', color: '#fff', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              List your gear →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {listings.map(listing => (
              <div key={listing.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{listing.emoji || CATEGORY_EMOJI[listing.category] || '📦'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{listing.title}</span>
                    {!listing.is_approved && pill('Pending approval', '#92400E', '#FEF3C7')}
                    {listing.is_approved && listing.is_active && pill('Live', '#1A7F4B', '#E6F4ED')}
                    {listing.is_approved && !listing.is_active && pill('Paused', '#5A7A96', 'var(--surface2)')}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {listing.location} · ${listing.price}/day · {listing.category}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  {listing.is_approved && (
                    <button
                      onClick={() => toggleActive(listing.id, listing.is_active)}
                      disabled={toggling === listing.id}
                      style={{ fontSize: 13, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                      {toggling === listing.id ? '...' : listing.is_active ? 'Pause' : 'Activate'}
                    </button>
                  )}
                  <button
                    onClick={() => deleteListing(listing.id)}
                    disabled={deleting === listing.id}
                    style={{ fontSize: 13, padding: '6px 12px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                    {deleting === listing.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking requests */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Booking requests</h2>

        {bookings.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No booking requests yet. They'll appear here when someone requests your gear.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map(booking => (
              <div key={booking.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{booking.renter_name}</span>
                      {booking.status === 'pending' || booking.status === 'pending_payment'
                        ? pill('Pending payment', '#92400E', '#FEF3C7')
                        : pill('Paid ✓', '#1A7F4B', '#E6F4ED')}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {booking.listing?.title} · {booking.days} day{booking.days !== 1 ? 's' : ''}
                      {booking.start_date ? ` · ${booking.start_date}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ocean)' }}>${booking.total_price}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You earn ${Math.round(booking.total_price * 0.85)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: booking.deposit_amount > 0 ? 12 : 0 }}>
                  <span>📧 {booking.renter_email}</span>
                  {booking.renter_phone && <span>📞 {booking.renter_phone}</span>}
                  {booking.message && <span>💬 "{booking.message}"</span>}
                </div>

                {booking.deposit_amount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      🔒 ${booking.deposit_amount} deposit
                    </span>
                    {(booking.deposit_status === 'authorized' || booking.deposit_status === 'held') && (
                      <>
                        <span style={{ fontSize: 12, color: '#92400E', background: '#FEF3C7', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>AUTH HOLD</span>
                        <button
                          onClick={() => handleDeposit(booking.id, 'release')}
                          disabled={depositAction !== null}
                          style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #A7D9BA', background: '#E6F4ED', color: '#1A7F4B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                          {depositAction === booking.id + 'release' ? '...' : 'Release to renter'}
                        </button>
                        <button
                          onClick={() => handleDeposit(booking.id, 'claim')}
                          disabled={depositAction !== null}
                          style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                          {depositAction === booking.id + 'claim' ? '...' : 'Claim for damage'}
                        </button>
                      </>
                    )}
                    {booking.deposit_status === 'released' && (
                      <span style={{ fontSize: 12, color: '#1A7F4B', fontWeight: 600 }}>✓ Refunded to renter</span>
                    )}
                    {booking.deposit_status === 'claimed' && (
                      <span style={{ fontSize: 12, color: '#991B1B', fontWeight: 600 }}>✓ Claimed — transferred to you</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
