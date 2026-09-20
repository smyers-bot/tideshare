import Link from 'next/link';
import NavBar from '@/app/components/NavBar';

const GEAR_EXAMPLES = [
  { emoji: '🏄', item: 'Surfboard', earn: '$45/day', weekend: '$270' },
  { emoji: '⛺', item: 'Camping Gear', earn: '$40–55/day', weekend: '$330' },
  { emoji: '🚣', item: 'Kayak', earn: '$40–65/day', weekend: '$390' },
  { emoji: '🚲', item: 'Bikes (pair)', earn: '$35/day', weekend: '$210' },
  { emoji: '⛳', item: 'Golf Club Set', earn: '$50–70/day', weekend: '$420' },
  { emoji: '🏖️', item: 'Beach Chairs + Umbrella', earn: '$25/day', weekend: '$150' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'List in 5 minutes',
    body: 'Tell us what you have, your price, and when it\'s available. We review and get it live within 24 hours. Free to list — always.',
  },
  {
    step: '2',
    title: 'Renter requests a booking',
    body: 'You get notified when someone wants your gear. Review their dates and message, then confirm or decline. You\'re always in control.',
  },
  {
    step: '3',
    title: 'They pick it up from you',
    body: 'Renters come to your location — you choose the pickup spot. Hand off the gear, collect payment through TideShare, done. Want to offer delivery? Set your own radius and fee, and that delivery fee goes straight to you.',
  },
  {
    step: '4',
    title: 'They return it, you keep 85%',
    body: 'After the rental, they bring it back. TideShare handles payment and takes just 15%. Your surfboard sitting in the garage earns nothing — this fixes that.',
  },
];

const FAQS = [
  {
    q: 'What if something gets damaged?',
    a: 'Renters agree to our Terms of Service before booking, which holds them liable for damage beyond normal wear and tear. We recommend setting a cash damage deposit in your listing description — collect it at pickup before handing over the gear. For expensive items, a $50–200 deposit is standard.',
  },
  {
    q: 'How do I get paid?',
    a: 'Payment is collected from the renter when they book and released to you within 24 hours of the rental ending. Direct deposit to your bank account.',
  },
  {
    q: 'Can I block off dates?',
    a: 'Yes — your availability calendar is fully in your control. Block any days you need the gear yourself, and renters can only book open dates.',
  },
  {
    q: 'Do I have to deliver the gear?',
    a: 'No. The default is renter pickup — they come to you. You can optionally offer delivery: set your own radius and fee, and that delivery fee goes directly to you on top of the rental. It\'s never required.',
  },
  {
    q: 'What gear can I list?',
    a: 'Anything a Charleston visitor might need: surfboards, kayaks, paddleboards, golf clubs, bikes, beach chairs, fishing gear, camping gear, and more. If you\'re not sure, just submit — we\'ll let you know.',
  },
];

export default function OwnersPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <NavBar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #0F1F2E 0%, #0077B6 100%)', padding: '72px 24px 80px', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 16px', fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '0.05em' }}>
            💰 For Charleston locals
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1px' }}>
            Your gear earns money<br />while you're not using it.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, opacity: 0.85, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Rent your surfboard, kayak, paddleboard, or clubs to Charleston visitors. You set the price, you control availability, renters come to you.
          </p>
          <Link href="/list" style={{ background: 'var(--sand)', color: '#0F1F2E', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            List your gear — it's free →
          </Link>
          <p style={{ fontSize: 13, opacity: 0.6, marginTop: 14 }}>Free to list · 15% fee only when you earn · Cancel any time</p>
        </div>
      </section>

      {/* Earnings table */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.3px' }}>What locals are earning</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 15, marginBottom: 40 }}>Based on typical weekend rentals (Fri–Sun, 3 days)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {GEAR_EXAMPLES.map(g => (
            <div key={g.item} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{g.emoji}</div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{g.item}</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{g.earn}</p>
              <div style={{ background: 'var(--ocean-light)', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 13, color: 'var(--ocean)', fontWeight: 700 }}>~{g.weekend}/weekend</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.3px' }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ocean)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {s.step}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pickup callout */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: 'var(--ocean-light)', border: '1px solid var(--ocean)', borderRadius: 16, padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 40, flexShrink: 0 }}>🤝</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--ocean)', marginBottom: 6 }}>Renters always come to you</p>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Renters come to you — you choose the pickup spot. Or offer delivery: set your own radius and fee, and that delivery fee goes straight into your pocket on top of the rental. Never required, always your call.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 40, letterSpacing: '-0.3px' }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {FAQS.map(f => (
              <div key={f.q} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28 }}>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.q}</p>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--ocean)', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Ready to start earning?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.6 }}>
            Takes 5 minutes. We review every listing and get it live within 24 hours.
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
    </div>
  );
}
