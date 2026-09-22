'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import NavBar from '@/app/components/NavBar';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');
  const bookingId = searchParams.get('booking_id');
  const depositSessionId = searchParams.get('deposit_session_id');

  const [phase, setPhase] = useState<'loading' | 'deposit_needed' | 'success'>('loading');
  const [authorizing, setAuthorizing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserName(data.user.user_metadata?.full_name || data.user.email || 'Renter');
      }
    });

    async function init() {
      // If coming back from deposit auth checkout, record the PI and show success
      if (depositSessionId && bookingId) {
        await fetch('/api/deposit/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ depositSessionId, bookingId }),
        });
        setPhase('success');
        return;
      }

      // Check if this booking needs a deposit authorization
      if (bookingId) {
        const { data: booking } = await supabase
          .from('bookings')
          .select('deposit_amount, deposit_status')
          .eq('id', bookingId)
          .single();

        if (booking && booking.deposit_amount > 0 && booking.deposit_status === 'pending_auth') {
          setPhase('deposit_needed');
          return;
        }
      }

      setPhase('success');
    }

    init();
  }, [bookingId, depositSessionId]);

  const authorizeDeposit = async () => {
    if (!bookingId) return;
    setAuthorizing(true);
    try {
      const res = await fetch('/api/deposit/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, listingId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Failed to create deposit hold');
    } catch (err: any) {
      alert('Error: ' + err.message);
      setAuthorizing(false);
    }
  };

  const skipDeposit = () => setPhase('success');

  const submitReview = async () => {
    if (!rating || !listingId) return;
    setSending(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, reviewer_id: userId, reviewer_name: userName, rating, comment }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (phase === 'deposit_needed') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <NavBar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 'calc(100vh - 60px)' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Rental paid!</h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
              One more step — the owner requires a security deposit hold on your card.
            </p>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 28 }}>🔒</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Security deposit — authorization hold only</p>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    This places a temporary hold on your card. <strong>No money is charged.</strong> The hold is voided automatically when the owner confirms gear was returned undamaged. It's only captured if damage is reported.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={authorizeDeposit}
              disabled={authorizing}
              style={{ width: '100%', padding: '14px', borderRadius: 8, background: 'var(--ocean)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 12 }}>
              {authorizing ? 'Redirecting to Stripe...' : 'Authorize security hold →'}
            </button>
            <button
              onClick={skipDeposit}
              style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', fontSize: 14, border: '1px solid var(--border)', cursor: 'pointer' }}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Booking confirmed!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
            Payment received. The gear owner will reach out within a few hours with pickup details.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
            Check your email for a receipt.
          </p>

          {listingId && !done && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24, textAlign: 'left' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>How was it?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Leave a quick rating to help other renters.</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)}
                    style={{ fontSize: 36, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: star <= rating ? '#f59e0b' : 'var(--border)', transition: 'color 0.1s' }}>
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <textarea
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 60, marginBottom: 12 }}
                  placeholder="Share anything that would help future renters... (optional)"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              )}
              {rating > 0 && (
                <button onClick={submitReview} disabled={sending}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, background: 'var(--ocean)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {sending ? 'Submitting...' : 'Submit review'}
                </button>
              )}
            </div>
          )}

          {done && (
            <div style={{ background: 'var(--ocean-light)', border: '1px solid var(--ocean)', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 14, color: 'var(--ocean)', fontWeight: 600 }}>
              ✓ Thanks for your review!
            </div>
          )}

          <Link href="/browse" style={{ background: 'var(--ocean)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Browse more gear
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
