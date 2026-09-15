import Link from 'next/link';

const CATEGORIES = [
  { emoji: '🏄', label: 'Surfboards' },
  { emoji: '🛻', label: 'Golf Carts' },
  { emoji: '⛳', label: 'Golf Clubs' },
  { emoji: '🚣', label: 'Kayaks' },
  { emoji: '🏖️', label: 'Beach Chairs' },
  { emoji: '🏄‍♀️', label: 'Paddleboards' },
  { emoji: '🚲', label: 'Bikes' },
  { emoji: '🤿', label: 'Snorkel Gear' },
];

const SAMPLE_LISTINGS = [
  { id: 1, title: 'Soft-top Surfboard', owner: 'Jake', location: 'Folly Beach', price: 45, emoji: '🏄', rating: 4.9, reviews: 23, tag: 'Most popular' },
  { id: 2, title: 'Street-legal Golf Cart', owner: 'Mary', location: "Isle of Palms", price: 120, emoji: '🛻', rating: 5.0, reviews: 11, tag: 'Top rated' },
  { id: 3, title: 'Tandem Kayak', owner: 'Chris', location: "Sullivan's Island", price: 65, emoji: '🚣', rating: 4.8, reviews: 17, tag: null },
  { id: 4, title: 'Beach Chair + Umbrella Set', owner: 'Dana', location: 'Folly Beach', price: 25, emoji: '🏖️', rating: 4.7, reviews: 31, tag: null },
  { id: 5, title: 'Paddleboard (11ft)', owner: 'Sam', location: 'Isle of Palms', price: 55, emoji: '🏄‍♀️', rating: 4.9, reviews: 8, tag: null },
  { id: 6, title: 'Beach Cruiser Bikes (2)', owner: 'Tara', location: 'Folly Beach', price: 35, emoji: '🚲', rating: 4.6, reviews: 19, tag: null },
  { id: 7, title: 'Full Golf Club Set (RH)', owner: 'Brett', location: 'Kiawah Island', price: 60, emoji: '⛳', rating: 5.0, reviews: 9, tag: 'New' },
  { id: 8, title: 'Ladies Golf Club Set', owner: 'Anne', location: 'Wild Dunes', price: 50, emoji: '⛳', rating: 4.8, reviews: 5, tag: null },
];

export default function Home() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px' }}>
            tide<span style={{ color: 'var(--sand)' }}>share</span>
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/browse" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Browse gear</Link>
            <Link href="/list" style={{ background: 'var(--ocean)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              List your gear
            </Link>
          </div>
        </div>
      </nav>

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
            Rent surfboards, golf clubs, golf carts, kayaks, and more directly from Charleston locals. Better prices, real people, no shop lines.
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
          {SAMPLE_LISTINGS.map(listing => (
            <Link key={listing.id} href={`/gear/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                {/* Gear image placeholder */}
                <div style={{ height: 180, background: 'linear-gradient(135deg, var(--ocean-light), var(--bg-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, position: 'relative' }}>
                  {listing.emoji}
                  {listing.tag && (
                    <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--ocean)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.03em' }}>
                      {listing.tag}
                    </span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{listing.title}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Listed by {listing.owner} · {listing.location}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ocean)' }}>${listing.price}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/day</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⭐ {listing.rating} ({listing.reviews})</span>
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
              { icon: '🔍', title: 'Find gear nearby', body: 'Browse surfboards, golf carts, kayaks and more listed by Charleston locals — pick your beach and your dates.' },
              { icon: '📲', title: 'Book instantly', body: 'Request the gear, the owner confirms, and you pay securely through the app. No shop, no waiting.' },
              { icon: '🤝', title: 'Meet your neighbor', body: 'Pick up the gear locally, enjoy your day, and return it when you\'re done. Simple as borrowing from a friend.' },
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

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2026 TideShare · Made in Charleston, SC 🌊
        </p>
      </footer>
    </main>
  );
}
