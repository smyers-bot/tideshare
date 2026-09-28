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

  useEffect(() => {
    const supabase = createClient();

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
