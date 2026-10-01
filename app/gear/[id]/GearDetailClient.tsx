'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import { track } from '@vercel/analytics';


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function GearDetailClient({ id }: { id: string }) {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'detail' | 'book' | 'requested'>('detail');
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', startDate: '', endDate: '', message: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [dateError, setDateError] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [hasCompletedBooking, setHasCompletedBooking] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data }) => {
        setListing(data || null);
        setLoading(false);
        if (data) track('listing_viewed', { title: data.title, category: data.category, location: data.location });
      });

    const supabaseAuth = createClient();
    supabaseAuth.auth.getUser().then(({ data }) => {
      if (data.user) {
        setForm(f => ({
          ...f,
          name: data.user!.user_metadata?.full_name || '',
          email: data.user!.email || '',
        }));
        setCurrentUserId(data.user.id);
        setCurrentUserName(data.user.user_metadata?.full_name || data.user.email || 'Anonymous');

        if (UUID_RE.test(id)) {
          supabaseAuth
            .from('bookings')
            .select('id')
            .eq('listing_id', id)
            .eq('renter_id', data.user.id)
            .eq('status', 'completed')
            .limit(1)
            .then(({ data: bookings }) => {
              setHasCompletedBooking((bookings?.length ?? 0) > 0);
            });
        }
      }
    });

    if (UUID_RE.test(id)) {
      fetch(`/api/reviews?listing_id=${id}`)
        .then(r => r.json())
        .then(d => { if (d.reviews) setReviews(d.reviews); });
    }
  }, [id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const days = (() => {
    if (!form.startDate || !form.endDate) return 1;
    const diff = (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000;
    return Math.max(1, Math.round(diff));
  })();

  const deliveryFee = wantsDelivery && listing?.delivery_fee ? listing.delivery_fee : 0;
  const rentalBase = listing ? listing.price * days : 0;
  const baseTotal = Math.round(rentalBase * 1.15 * 100) / 100;
  const grandTotal = Math.round((baseTotal + deliveryFee) * 100) / 100;
  const tideshareFeeDue = Math.round((baseTotal - rentalBase) * 100) / 100;

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: 6, display: 'block', letterSpacing: '0.02em',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <NavBar />
        <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>Listing not found.</p>
        <Link href="/browse" style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'none' }}>← Browse gear</Link>
      </div>
    );
  }

  if (step === 'requested') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Request sent to {listing.owner_name}!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
            {listing.owner_name} will confirm within a few hours. Once they accept, you'll receive a payment link at <strong>{form.email}</strong>.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
            No payment is charged until {listing.owner_name} confirms.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            Free cancellation up to 48 hours before your rental start.
          </p>
          <Link href="/browse" style={{ background: 'var(--ocean)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Browse more gear
          </Link>
        </div>
      </div>
    );
  }

  const available = listing.is_active !== false;
  const bookable = listing.bookable !== false;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div className="gear-detail-grid">

          {/* Left — listing detail */}
          <div>
            <div style={{ height: 280, background: listing.photo_url ? 'none' : 'linear-gradient(135deg, var(--ocean-light), var(--bg-subtle))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, marginBottom: 28, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {listing.photo_url
                ? <img src={listing.photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : listing.emoji}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.3px' }}>{listing.title}</h1>
              {!available && <span style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>Unavailable</span>}
              {available && !bookable && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>Coming soon</span>}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>
              📍 {listing.location} {reviews.length > 0
                ? `· ⭐ ${(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})`
                : ''}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                {(listing.owner_name || 'O')[0]}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Listed by {listing.owner_name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>TideShare local{listing.owner_since ? ` since ${listing.owner_since}` : ''}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                📍 Pickup at {listing.location}
              </span>
              {listing.fulfillment_type === 'delivery' && listing.delivery_radius > 0 && (
                <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  🚗 Delivery within {listing.delivery_radius} mi (+${listing.delivery_fee})
                </span>
              )}
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>About this gear</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>{listing.description}</p>

            {listing.rules && listing.rules.length > 0 && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Ground rules</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {listing.rules.map((rule: string) => (
                    <li key={rule} style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--ocean)', fontWeight: 700, flexShrink: 0 }}>·</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Reviews section */}
            {UUID_RE.test(id) && (
              <div style={{ marginTop: 36 }} id="reviews">
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>

                {reviews.length > 0 && (() => {
                  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--ocean)' }}>{avg.toFixed(1)}</span>
                      <div>
                        <div style={{ fontSize: 18, letterSpacing: 2 }}>
                          {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{r.reviewer_name}</span>
                          <span style={{ marginLeft: 10, color: '#f59e0b', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {r.comment && <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>

                {/* Leave a review form — completed renters only */}
                {UUID_RE.test(id) && currentUserId && hasCompletedBooking && !reviewDone && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Leave a review</h3>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: star <= reviewForm.rating ? '#f59e0b' : 'var(--border)' }}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 70 }}
                      placeholder="How was your experience? (optional)"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    />
                    <button
                      onClick={async () => {
                        if (!reviewForm.rating) return;
                        setReviewSending(true);
                        try {
                          const res = await fetch('/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ listing_id: id, rating: reviewForm.rating, comment: reviewForm.comment }),
                          });
                          const data = await res.json();
                          if (data.error) throw new Error(data.error);
                          setReviewDone(true);
                          // Refresh reviews
                          fetch(`/api/reviews?listing_id=${id}`).then(r => r.json()).then(d => { if (d.reviews) setReviews(d.reviews); });
                        } catch (err: any) {
                          alert('Error: ' + err.message);
                        } finally {
                          setReviewSending(false);
                        }
                      }}
                      disabled={!reviewForm.rating || reviewSending}
                      style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8, background: reviewForm.rating ? 'var(--ocean)' : 'var(--border)', color: reviewForm.rating ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 700, border: 'none', cursor: reviewForm.rating ? 'pointer' : 'not-allowed' }}>
                      {reviewSending ? 'Submitting...' : 'Submit review'}
                    </button>
                  </div>
                )}
                {reviewDone && (
                  <p style={{ fontSize: 14, color: 'var(--ocean)', fontWeight: 600 }}>✓ Thanks for your review!</p>
                )}
                {UUID_RE.test(id) && currentUserId && !hasCompletedBooking && !reviewDone && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Reviews are available after a completed rental.</p>
                )}
                {UUID_RE.test(id) && !currentUserId && (
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    <a href="/auth/signin" style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a> to leave a review.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right — booking card */}
          <div className="gear-detail-sticky">
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--ocean)' }}>${listing.price}</span>
                <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>/day</span>
              </div>

              {step === 'detail' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: dateError ? 6 : 14 }}>
                    <div>
                      <label style={labelStyle}>Start date</label>
                      <input style={{ ...inputStyle, borderColor: dateError ? '#ef4444' : undefined }} type="date" value={form.startDate}
                        onChange={e => {
                          set('startDate', e.target.value);
                          setDateError('');
                          if (form.endDate && e.target.value > form.endDate) set('endDate', '');
                        }} />
                    </div>
                    <div>
                      <label style={labelStyle}>End date</label>
                      <input style={{ ...inputStyle, borderColor: dateError ? '#ef4444' : undefined }} type="date" value={form.endDate}
                        onChange={e => { set('endDate', e.target.value); setDateError(''); }} />
                    </div>
                  </div>
                  {dateError && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10, marginTop: 0 }}>{dateError}</p>}

                  {listing.fulfillment_type === 'delivery' && listing.delivery_radius > 0 && (
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, cursor: 'pointer', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 14 }}>
                      <input type="checkbox" checked={wantsDelivery} onChange={e => setWantsDelivery(e.target.checked)} />
                      <span>🚗 Add delivery (+${listing.delivery_fee}) — within {listing.delivery_radius} mi</span>
                    </label>
                  )}

                  {form.startDate && form.endDate && (
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>${listing.price} &times; {days} day{days !== 1 ? 's' : ''}</span>
                        <span style={{ fontWeight: 600 }}>${listing.price * days}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>TideShare fee (15%)</span>
                        <span style={{ fontWeight: 600 }}>${tideshareFeeDue.toFixed(2)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Delivery fee</span>
                          <span style={{ fontWeight: 600 }}>${deliveryFee}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontWeight: 800, color: 'var(--ocean)' }}>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {UUID_RE.test(id) && !listing.stripe_account_id && (
                    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontSize: 13, color: '#92400E' }}>
                      ⚠️ This owner is still setting up payments. You can request — they'll reach out to arrange payment directly.
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (!available || !bookable) return;
                      const today = new Date().toISOString().split('T')[0];
                      if (form.startDate && form.startDate < today) { setDateError('Start date cannot be in the past.'); return; }
                      if (form.startDate && form.endDate && form.endDate < form.startDate) { setDateError('End date must be after start date.'); return; }
                      if (form.startDate && form.endDate && days > 60) { setDateError('Rental period cannot exceed 60 days.'); return; }
                      setDateError('');
                      setStep('book');
                      track('booking_started', { title: listing.title, price: listing.price, location: listing.location });
                    }}
                    disabled={!available || !bookable}
                    style={{ width: '100%', padding: '14px', borderRadius: 8, background: (available && bookable) ? 'var(--ocean)' : 'var(--border)', color: (available && bookable) ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: (available && bookable) ? 'pointer' : 'not-allowed' }}>
                    {!available ? 'Currently unavailable' : !bookable ? "This gear isn't available yet — check back soon" : 'Request to book'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    No charge until {listing.owner_name} confirms
                  </p>
                  {listing.deposit_amount > 0 ? (
                    <>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                        🔒 ${listing.deposit_amount} card hold placed after booking — not a charge. Released by owner after a clean return, or auto-expires in 7 days.
                      </p>
                      {days > 7 && (
                        <p style={{ fontSize: 12, color: '#92400E', textAlign: 'center', marginTop: 4 }}>
                          ⚠️ Your rental is longer than 7 days — the deposit hold may expire before you return the gear.
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                      No deposit required
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
                    Free cancellation 48+ hrs before start
                  </p>
                </>
              )}

              {step === 'book' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Your name</label>
                    <input style={inputStyle} placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} placeholder="(843) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Message to {listing.owner_name} (optional)</label>
                    <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                      placeholder={`Hi ${listing.owner_name}, I'd love to rent your ${listing.title}...`}
                      value={form.message} onChange={e => set('message', e.target.value)} />
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 14px', fontSize: 14 }}>
                    {form.startDate && form.endDate ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{form.startDate} → {form.endDate}</span>
                          <span style={{ fontWeight: 600 }}>{days} day{days !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>${listing.price} &times; {days} day{days !== 1 ? 's' : ''}</span>
                          <span style={{ fontWeight: 600 }}>${listing.price * days}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>TideShare fee (15%)</span>
                          <span style={{ fontWeight: 600 }}>${tideshareFeeDue.toFixed(2)}</span>
                        </div>
                        {deliveryFee > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                            <span style={{ fontWeight: 600 }}>${deliveryFee}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                          <span style={{ fontWeight: 700 }}>Total due at confirm</span>
                          <span style={{ fontWeight: 800, color: 'var(--ocean)' }}>${grandTotal.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>No dates selected — you'll confirm pricing with {listing.owner_name}.</p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, marginBottom: 0 }}>
                      No charge until {listing.owner_name} confirms · Free cancellation 48+ hrs before start
                    </p>
                  </div>

                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>I agree to the <Link href="/terms" target="_blank" style={{ color: 'var(--ocean)' }}>Terms of Service</Link> and am liable for any damage to rented gear beyond normal wear.</span>
                  </label>

                  <button
                    onClick={async () => {
                      if (!form.name || !form.email || !form.phone || !agreedToTerms) return;
                      setSending(true);
                      try {
                        // Save booking to Supabase via server route (works for authenticated and guest renters)
                        let bookingId = '';
                        if (UUID_RE.test(id)) {
                          const bRes = await fetch('/api/bookings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              listing_id: id,
                              renter_name: form.name,
                              renter_email: form.email,
                              renter_phone: form.phone,
                              start_date: form.startDate || null,
                              end_date: form.endDate || null,
                              days,
                              total_price: grandTotal,
                              message: form.message || '',
                            }),
                          });
                          const bData = await bRes.json();
                          bookingId = bData.bookingId || '';
                        }

                        if (UUID_RE.test(id) && listing.owner_email) {
                          await fetch('/api/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'booking_request',
                              ownerEmail: listing.owner_email,
                              ownerName: listing.owner_name,
                              renterName: form.name,
                              renterEmail: form.email,
                              renterPhone: form.phone,
                              gearTitle: listing.title,
                              gearPrice: listing.price,
                              startDate: form.startDate || 'Not specified',
                              endDate: form.endDate || 'Not specified',
                              total: grandTotal,
                              message: form.message || '',
                            }),
                          });
                        }

                        track('booking_requested', { title: listing.title, price: listing.price, days, total: grandTotal });
                        setStep('requested');
                      } catch (err: any) {
                        alert('Error: ' + (err?.text || err?.message || JSON.stringify(err)));
                      } finally {
                        setSending(false);
                      }
                    }}
                    disabled={!form.name || !form.email || !form.phone || !agreedToTerms || sending}
                    style={{ width: '100%', padding: '14px', borderRadius: 8, background: form.name && form.email && form.phone && agreedToTerms ? 'var(--ocean)' : 'var(--border)', color: form.name && form.email && form.phone && agreedToTerms ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: form.name && form.email && form.phone && agreedToTerms ? 'pointer' : 'not-allowed' }}>
                    {sending ? 'Sending...' : 'Send booking request →'}
                  </button>
                  <button onClick={() => setStep('detail')} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', fontSize: 14, border: '1px solid var(--border)', cursor: 'pointer' }}>
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
