'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { use } from 'react';
import emailjs from '@emailjs/browser';
import { createClient } from '@/app/lib/supabase/client';
import NavBar from '@/app/components/NavBar';

const EMAILJS_SERVICE = 'service_ssteci9';
const EMAILJS_BOOKING_TEMPLATE = 'template_2m74q94';
const EMAILJS_PUBLIC_KEY = 'mYya3x3YoyhvwzvYR';

const HARDCODED: Record<string, any> = {
  '1': { title: 'Soft-top Surfboard', owner_name: 'Jake', owner_since: 'May 2026', location: 'Folly Beach', price: 45, emoji: '🏄', rating: 4.9, reviews_count: 23, category: 'Surfboards', is_active: true, description: "Perfect beginner/intermediate board. 7ft soft-top, super stable. Comes with leash and wax. Pickup at my place 2 blocks from the water — I'll give you a quick rundown on local breaks.", rules: ['No surfing past sunset', 'Rinse off before return', 'Minor dings happen — major damage is on you'] },
  '2': { title: 'Tandem Paddleboard Set', owner_name: 'Mary', owner_since: 'March 2025', location: 'Isle of Palms', price: 75, emoji: '🏄‍♀️', rating: 5.0, reviews_count: 11, category: 'Paddleboards', is_active: true, description: "Two 11ft paddleboards perfect for exploring IOP together. Both include paddles and leashes. Great for calm mornings on the Intracoastal or the connector beach.", rules: ['Leashes must be worn', 'No offshore paddling', 'Return clean and dry'] },
  '3': { title: 'Tandem Kayak', owner_name: 'Chris', owner_since: 'June 2025', location: "Sullivan's Island", price: 65, emoji: '🚣', rating: 4.8, reviews_count: 17, category: 'Kayaks', is_active: true, description: "Stable tandem kayak great for the Intracoastal or calm ocean paddling. Includes paddles, two PFDs, and a dry bag.", rules: ['PFDs must be worn', 'No open water past the inlet', 'Return by 6pm'] },
  '4': { title: 'Beach Chair + Umbrella Set', owner_name: 'Dana', owner_since: 'April 2026', location: 'Folly Beach', price: 25, emoji: '🏖️', rating: 4.7, reviews_count: 31, category: 'Beach Chairs', is_active: true, description: "2 low-slung beach chairs + large umbrella. Folds into a carry bag.", rules: ['Return same day by 7pm', 'Keep sand out of chair fabric'] },
  '5': { title: 'Paddleboard (11ft)', owner_name: 'Sam', owner_since: 'January 2026', location: 'Isle of Palms', price: 55, emoji: '🏄‍♀️', rating: 4.9, reviews_count: 8, category: 'Paddleboards', is_active: true, description: "Solid epoxy 11ft board, great for flat water and light chop. Includes paddle and leash.", rules: ['Leash must be worn', 'No offshore paddling', 'Return clean and dry'] },
  '6': { title: 'Beach Cruiser Bikes (2)', owner_name: 'Tara', owner_since: 'May 2025', location: 'Folly Beach', price: 35, emoji: '🚲', rating: 4.6, reviews_count: 19, category: 'Bikes', is_active: false, description: "Two matching beach cruisers with baskets. Helmets included.", rules: ['Helmets must be worn', 'Lock bikes when not in use', 'Return by 8pm'] },
  '7': { title: 'Camping Gear Bundle', owner_name: 'Rob', owner_since: 'February 2025', location: 'James Island', price: 55, emoji: '⛺', rating: 4.8, reviews_count: 6, category: 'Camping Gear', is_active: true, description: "4-person tent, sleeping bags, camp chairs, and a portable camp stove.", rules: ['Return all items packed as received', 'No open fires near tent', 'Return by 10am on checkout day'] },
  '8': { title: 'Single Kayak', owner_name: 'Lisa', owner_since: 'July 2025', location: 'Folly Beach', price: 40, emoji: '🚣', rating: 4.9, reviews_count: 12, category: 'Kayaks', is_active: true, description: "Nimble sit-on-top kayak, great for solo paddlers.", rules: ['PFD must be worn', 'Return by sunset'] },
  '9': { title: 'Fishing Rod + Tackle Kit', owner_name: 'Mike', owner_since: 'June 2026', location: "Sullivan's Island", price: 22, emoji: '🎣', rating: 4.5, reviews_count: 7, category: 'Fishing Gear', is_active: true, description: "Medium-heavy spinning rod with reel, plus a full tackle kit.", rules: ['Return tackle kit with same contents', 'Rinse rod and reel after saltwater use', 'Return same day'] },
  '10': { title: 'Full Golf Club Set (RH)', owner_name: 'Brett', owner_since: 'August 2026', location: 'Kiawah Island', price: 60, emoji: '⛳', rating: 5.0, reviews_count: 9, category: 'Golf Clubs', is_active: true, description: "Callaway Rogue ST irons, TaylorMade driver, full bag with 14 clubs. Right-handed.", rules: ['No range balls with irons', 'Clean clubs before return', 'Lost club replacement at retail cost'] },
  '11': { title: 'Ladies Golf Club Set', owner_name: 'Anne', owner_since: 'July 2026', location: 'Wild Dunes', price: 50, emoji: '⛳', rating: 4.8, reviews_count: 5, category: 'Golf Clubs', is_active: true, description: "Ping G Le3 ladies set, graphite shafts. Full bag.", rules: ['Clean clubs before return', 'Handle with care'] },
  '12': { title: 'Golf Club Set + Push Cart', owner_name: 'Dave', owner_since: 'September 2026', location: 'Mount Pleasant', price: 70, emoji: '⛳', rating: 4.7, reviews_count: 3, category: 'Golf Clubs', is_active: true, description: "Cleveland set with Clicgear push cart. Right-handed.", rules: ['Return cart folded', 'Clean clubs before return'] },
  '13': { title: 'Beach Day Bundle', owner_name: 'Dana', owner_since: 'April 2026', location: 'Folly Beach', price: 45, emoji: '🎉', rating: 4.9, reviews_count: 14, category: 'Bundles', is_active: true, description: "2 beach chairs, large shade umbrella, Spikeball set, and Kan Jam.", rules: ['Return same day by 7pm', 'Return games with all pieces'] },
  '14': { title: 'Family Beach Bundle', owner_name: 'Sarah', owner_since: 'May 2026', location: 'Isle of Palms', price: 65, emoji: '👨‍👩‍👧‍👦', rating: 5.0, reviews_count: 8, category: 'Bundles', is_active: true, description: "4 beach chairs, XL umbrella, 30qt cooler, cornhole, and Spikeball.", rules: ['Return same day by 7pm', 'Return cooler emptied and rinsed'] },
  '15': { title: 'Surf & Sand Bundle', owner_name: 'Jake', owner_since: 'May 2026', location: 'Folly Beach', price: 75, emoji: '🏄', rating: 4.8, reviews_count: 6, category: 'Bundles', is_active: true, description: "7ft soft-top surfboard + 2 beach chairs + shade umbrella.", rules: ['No surfing past sunset', 'Return chairs same day by 7pm'] },
  '16': { title: 'Golf & Cooler Bundle', owner_name: 'Brett', owner_since: 'August 2026', location: 'Kiawah Island', price: 80, emoji: '⛳', rating: 5.0, reviews_count: 4, category: 'Bundles', is_active: true, description: "Full Callaway iron set + TaylorMade driver + 30qt Yeti cooler pre-loaded with ice.", rules: ['Clean clubs before return', 'Return cooler emptied and rinsed'] },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'detail' | 'book' | 'confirmed'>('detail');
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', startDate: '', endDate: '', message: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    if (UUID_RE.test(id)) {
      const supabase = createClient();
      supabase.from('listings').select('*').eq('id', id).single()
        .then(({ data }) => { setListing(data || null); setLoading(false); });
    } else {
      setListing(HARDCODED[id] || null);
      setLoading(false);
    }
    // Pre-fill user info if signed in
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
      }
    });

    // Fetch reviews for real listings
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
  const baseTotal = Math.round(listing ? listing.price * days * 1.15 : 0);
  const grandTotal = baseTotal + deliveryFee;

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

  if (step === 'confirmed') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Request sent to {listing.owner_name}!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
            We've notified {listing.owner_name} of your request. They'll confirm within a few hours and reach out to {form.email} with pickup details.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            No payment is charged until {listing.owner_name} confirms.
          </p>
          <Link href="/browse" style={{ background: 'var(--ocean)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Browse more gear
          </Link>
        </div>
      </div>
    );
  }

  const available = listing.is_active !== false;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

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
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>
              📍 {listing.location} {listing.rating ? `· ⭐ ${listing.rating} (${listing.reviews_count} reviews)` : ''}
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

            {/* Reviews section — real listings only */}
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

                {/* Leave a review form */}
                {currentUserId && !reviewDone && (
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
                            body: JSON.stringify({ listing_id: id, reviewer_id: currentUserId, reviewer_name: currentUserName, rating: reviewForm.rating, comment: reviewForm.comment }),
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
                {!currentUserId && (
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    <a href="/auth/signin" style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a> to leave a review.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right — booking card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--ocean)' }}>${listing.price}</span>
                <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>/day</span>
              </div>

              {step === 'detail' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Start date</label>
                      <input style={inputStyle} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>End date</label>
                      <input style={inputStyle} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                    </div>
                  </div>

                  {listing.fulfillment_type === 'delivery' && listing.delivery_radius > 0 && (
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, cursor: 'pointer', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 14 }}>
                      <input type="checkbox" checked={wantsDelivery} onChange={e => setWantsDelivery(e.target.checked)} />
                      <span>🚗 Add delivery (+${listing.delivery_fee}) — within {listing.delivery_radius} mi</span>
                    </label>
                  )}

                  {form.startDate && form.endDate && (
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>${listing.price} × {days} day{days !== 1 ? 's' : ''}</span>
                        <span style={{ fontWeight: 600 }}>${listing.price * days}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>TideShare fee (15%)</span>
                        <span style={{ fontWeight: 600 }}>${Math.round(listing.price * days * 0.15)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Delivery fee</span>
                          <span style={{ fontWeight: 600 }}>${deliveryFee}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontWeight: 800, color: 'var(--ocean)' }}>${grandTotal}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => available && setStep('book')}
                    disabled={!available}
                    style={{ width: '100%', padding: '14px', borderRadius: 8, background: available ? 'var(--ocean)' : 'var(--border)', color: available ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: available ? 'pointer' : 'not-allowed' }}>
                    {available ? 'Request to book' : 'Currently unavailable'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    No charge until {listing.owner_name} confirms
                  </p>
                  {listing.deposit_amount > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                      🔒 ${listing.deposit_amount} refundable deposit · returned within 48 hrs
                    </p>
                  )}
                </>
              )}

              {step === 'book' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Your name</label>
                    <input style={inputStyle} placeholder="Alex Smith" value={form.name} onChange={e => set('name', e.target.value)} />
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

                  {form.startDate && form.endDate && (
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 14px', fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>Total due at confirm</span>
                        <span style={{ fontWeight: 800, color: 'var(--ocean)' }}>${grandTotal}</span>
                      </div>
                    </div>
                  )}

                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>I agree to the <Link href="/terms" target="_blank" style={{ color: 'var(--ocean)' }}>Terms of Service</Link> and am liable for any damage to rented gear beyond normal wear.</span>
                  </label>

                  <button
                    onClick={async () => {
                      if (!form.name || !form.email || !form.phone || !agreedToTerms) return;
                      setSending(true);
                      try {
                        // Save booking to Supabase (for real DB listings only)
                        if (UUID_RE.test(id)) {
                          const supabase = createClient();
                          await supabase.from('bookings').insert({
                            listing_id: id,
                            renter_name: form.name,
                            renter_email: form.email,
                            renter_phone: form.phone,
                            start_date: form.startDate || null,
                            end_date: form.endDate || null,
                            days,
                            total_price: grandTotal,
                            message: form.message || '',
                            status: 'pending_payment',
                          });
                        }

                        await emailjs.send(EMAILJS_SERVICE, EMAILJS_BOOKING_TEMPLATE, {
                          gear_title: listing.title, gear_owner: listing.owner_name, gear_price: listing.price,
                          start_date: form.startDate || 'Not specified', end_date: form.endDate || 'Not specified',
                          total: form.startDate && form.endDate ? `$${Math.round(listing.price * days * 1.15)}` : 'TBD',
                          renter_name: form.name, renter_email: form.email, renter_phone: form.phone,
                          message: form.message || 'No message provided',
                        }, EMAILJS_PUBLIC_KEY);

                        const res = await fetch('/api/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ gearTitle: listing.title, price: listing.price, days, renterEmail: form.email, stripeAccountId: listing.stripe_account_id || '', deliveryFee, listingId: UUID_RE.test(id) ? id : '' }),
                        });
                        const data = await res.json();
                        if (data.error) throw new Error(data.error);
                        window.location.href = data.url;
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
    </div>
  );
}
