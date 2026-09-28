import type { Metadata } from 'next';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import { createClient } from '@/app/lib/supabase/server';

export const metadata: Metadata = {
  title: 'TideShare — Rent Beach & Outdoor Gear in Charleston SC',
  description: 'Rent surfboards, kayaks, paddleboards, bikes, golf clubs and beach chairs from locals in Charleston, Isle of Palms, Folly Beach, Kiawah Island and Sullivan\'s Island. Better prices than shops.',
};

const CATEGORIES = [
  { emoji: '🎉', label: 'Bundles' },
  { emoji: '🏄', label: 'Surfboards' },
  { emoji: '⛺', label: 'Camping Gear' },
  { emoji: '⛳', label: 'Golf Clubs' },
  { emoji: '🚣', label: 'Kayaks' },
  { emoji: '🏖️', label: 'Beach Chairs' },
  { emoji: '🏄‍♀️', label: 'Paddleboards' },
  { emoji: '🚲', label: 'Bikes' },
  { emoji: '🎣', label: 'Fishing Gear' },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: featuredListings } = await supabase
    .from('listings')
    .select('id, title, owner_name, location, price, emoji, photo_url, category')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <NavBar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #0077B6 0%, #0096C7 50%, #00B4D8 100%)', padding: '72px 24px 80px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 16px', fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '0.05em' }}>
            🌊 Charleston locals renting to Charleston visitors
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1px' }}>
            Beach gear from<br />your neighbors.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, opacity: 0.9, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Rent surfboards, golf clubs, kayaks, paddleboards, and more directly from Charleston locals. Better prices, real people, no shop lines.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse" style={{ background: '#fff', color: 'var(--ocean)', padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Browse gear →
            </Link>
            <Link href="/list" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Earn money listing gear
            </Link>
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 16 }}>Folly Beach · Isle of Palms · Sullivan's Island</p>
        </div>
      </section>

      {/* Categories */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '28px 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <Link key={c.label} href={`/browse?category=${encodeURIComponent(c.label)}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', textDecoration: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', minWidth: 80 }}>
              <span style={{ fontSize: 24 }}>{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.3px' }}>Popular near you</h2>
          <Link href="/browse" style={{ fontSize: 14, color: 'var(--ocean)', fontWeight: 600, textDecoration: 'none' }}>See all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {(featuredListings || []).map(listing => (
            <Link key={listing.id} href={`/gear/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ height: 180, background: listing.photo_url ? 'none' : 'linear-gradient(135deg, var(--ocean-light), var(--bg-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, overflow: 'hidden' }}>
                  {listing.photo_url
                    ? <img src={listing.photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : listing.emoji}
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{listing.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Listed by {listing.owner_name} · {listing.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ocean)' }}>${listing.price}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/day</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ocean)', background: 'var(--ocean-light)', padding: '2px 8px', borderRadius: 6 }}>New</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.3px' }}>How TideShare works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40 }}>
            {[
              { icon: '🔍', title: 'Find gear nearby', body: 'Browse surfboards, kayaks, paddleboards, golf clubs and more listed by Charleston locals — pick your beach and your dates.' },
              { icon: '📲', title: 'Request to rent', body: 'Send a booking request, the owner confirms, and you pay securely through the app. No shop, no waiting.' },
              { icon: '🤝', title: 'Pick up or get delivery', body: 'Pick up locally — or if the owner offers delivery, have it brought to you. Return it when you\'re done. Simple as borrowing from a friend.' },
            ].map(s => (
              <div key={s.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Renter & Owner workflows */}
      <section style={{ padding: '64px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.3px' }}>Simple for everyone</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 15, marginBottom: 48 }}>Whether you're renting gear or listing it, the process is straightforward.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>

            {/* Renter side */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ fontSize: 24 }}>🏄</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Renting gear</h3>
              </div>
              {[
                { n: '1', text: 'Browse gear near your beach and pick your dates.' },
                { n: '2', text: 'Send a booking request — no payment yet.' },
                { n: '3', text: 'Owner confirms within a few hours, then you pay securely.' },
                { n: '4', text: 'Pick up locally, or get delivery if the owner offers it.' },
                { n: '5', text: 'Return it when you\'re done. That\'s it.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--ocean)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s.n}</span>
                  <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>{s.text}</p>
                </div>
              ))}
              <Link href="/browse" style={{ display: 'inline-block', marginTop: 8, background: 'var(--ocean)', color: '#fff', padding: '11px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Browse gear →
              </Link>
            </div>

            {/* Owner side */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ fontSize: 24 }}>💰</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Listing gear</h3>
              </div>
              {[
                { n: '1', text: 'List your gear free in under 5 minutes — you set the price.' },
                { n: '2', text: 'Get notified when someone requests your dates.' },
                { n: '3', text: 'Confirm or decline. You\'re always in control.' },
                { n: '4', text: 'Renter pays securely. You keep 85% — paid within 24 hrs of return.' },
                { n: '5', text: 'Optional deposit protects you if anything comes back damaged.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--sand)', color: '#0F1F2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s.n}</span>
                  <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>{s.text}</p>
                </div>
              ))}
              <Link href="/list" style={{ display: 'inline-block', marginTop: 8, background: 'var(--sand)', color: '#0F1F2E', padding: '11px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                List your gear free →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* List your gear CTA */}
      <section style={{ background: 'var(--ocean)', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Got gear collecting dust?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.6 }}>
            Your surfboard can earn $200+ a weekend. List it free in under 5 minutes.
          </p>
          <Link href="/list" style={{ background: 'var(--sand)', color: '#0F1F2E', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            List your gear — it's free
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
