'use client';
import Link from 'next/link';
import { useState } from 'react';
import { use } from 'react';

const ALL_LISTINGS: Record<string, any> = {
  '1': { title: 'Soft-top Surfboard', owner: 'Jake', ownerSince: 'May 2026', location: 'Folly Beach', price: 45, emoji: '🏄', rating: 4.9, reviews: 23, category: 'Surfboards', available: true, description: 'Perfect beginner/intermediate board. 7ft soft-top, super stable. Comes with leash and wax. Pickup at my place 2 blocks from the water — I\'ll give you a quick rundown on local breaks.', rules: ['No surfing past sunset', 'Rinse off before return', 'Minor dings happen — major damage is on you'] },
  '2': { title: 'Street-legal Golf Cart', owner: 'Mary', ownerSince: 'March 2025', location: 'Isle of Palms', price: 120, emoji: '🛻', rating: 5.0, reviews: 11, category: 'Golf Carts', available: true, description: '4-seat electric golf cart, fully street legal on IOP. Perfect for getting around the island all day. Comes fully charged. I\'m right off Palm Blvd — easy pickup.', rules: ['Must be 25+ to drive', 'No driving after midnight', 'Return with same charge level'] },
  '3': { title: 'Tandem Kayak', owner: 'Chris', ownerSince: 'June 2025', location: "Sullivan's Island", price: 65, emoji: '🚣', rating: 4.8, reviews: 17, category: 'Kayaks', available: true, description: 'Stable tandem kayak great for the Intracoastal or calm ocean paddling. Includes paddles, two PFDs, and a dry bag. Great for spotting dolphins around Sullivan\'s.', rules: ['PFDs must be worn', 'No open water past the inlet', 'Return by 6pm'] },
  '4': { title: 'Beach Chair + Umbrella Set', owner: 'Dana', ownerSince: 'April 2026', location: 'Folly Beach', price: 25, emoji: '🏖️', rating: 4.7, reviews: 31, category: 'Beach Chairs', available: true, description: '2 low-slung beach chairs + large umbrella. Folds into a carry bag. Delivery to the Folly Beach county park area available for $5 extra. Just ask!', rules: ['Return same day by 7pm', 'Keep sand out of chair fabric'] },
  '5': { title: 'Paddleboard (11ft)', owner: 'Sam', ownerSince: 'January 2026', location: 'Isle of Palms', price: 55, emoji: '🏄‍♀️', rating: 4.9, reviews: 8, category: 'Paddleboards', available: true, description: 'Solid epoxy 11ft board, great for flat water and light chop. Includes paddle and leash. Launch right from the IOP connector beach or take to any access point.', rules: ['Leash must be worn', 'No offshore paddling', 'Return clean and dry'] },
  '6': { title: 'Beach Cruiser Bikes (2)', owner: 'Tara', ownerSince: 'May 2025', location: 'Folly Beach', price: 35, emoji: '🚲', rating: 4.6, reviews: 19, category: 'Bikes', available: false, description: 'Two matching beach cruisers with baskets. Perfect for riding the Folly Beach strip or grabbing breakfast. Helmets included.', rules: ['Helmets must be worn', 'Lock bikes when not in use', 'Return by 8pm'] },
  '7': { title: '4-seat Golf Cart', owner: 'Rob', ownerSince: 'February 2025', location: 'Isle of Palms', price: 150, emoji: '🛻', rating: 4.8, reviews: 6, category: 'Golf Carts', available: true, description: 'Spacious 4-seater, lifted with big tires. Street legal. Great for families. Comes with a cooler in back. Best cart on the island — Rob\'s been renting since 2025.', rules: ['Must be 25+ to drive', 'No beach driving', 'Return fully charged'] },
  '8': { title: 'Single Kayak', owner: 'Lisa', ownerSince: 'July 2025', location: 'Folly Beach', price: 40, emoji: '🚣', rating: 4.9, reviews: 12, category: 'Kayaks', available: true, description: 'Nimble sit-on-top kayak, great for solo paddlers. Explore the creeks and marshes behind Folly or paddle to Morris Island lighthouse.', rules: ['PFD must be worn', 'Return by sunset'] },
  '9': { title: 'Snorkel Set', owner: 'Mike', ownerSince: 'June 2026', location: "Sullivan's Island", price: 18, emoji: '🤿', rating: 4.5, reviews: 7, category: 'Snorkel Gear', available: true, description: 'Full snorkel set — mask, fins, and snorkel. Sanitized between each rental. Best visibility is around the jetties at low tide.', rules: ['Rinse equipment after use', 'Return same day'] },
  '10': { title: 'Full Golf Club Set (RH)', owner: 'Brett', ownerSince: 'August 2026', location: 'Kiawah Island', price: 60, emoji: '⛳', rating: 5.0, reviews: 9, category: 'Golf Clubs', available: true, description: 'Callaway Rogue ST irons, TaylorMade driver, full bag with 14 clubs. Right-handed. Bag has a stand and all pockets. Way better than anything you\'ll rent at the pro shop — at half the price. I\'m 10 min from the Kiawah resort.', rules: ['No range balls with irons', 'Clean clubs before return', 'Lost club replacement at retail cost'] },
  '11': { title: 'Ladies Golf Club Set', owner: 'Anne', ownerSince: 'July 2026', location: 'Wild Dunes', price: 50, emoji: '⛳', rating: 4.8, reviews: 5, category: 'Golf Clubs', available: true, description: 'Ping G Le3 ladies set, graphite shafts, super forgiving. Full bag. Right-handed. Ideal for casual rounds at Wild Dunes or any Charleston-area course.', rules: ['Clean clubs before return', 'Handle with care'] },
  '12': { title: 'Golf Club Set + Push Cart', owner: 'Dave', ownerSince: 'September 2026', location: 'Mount Pleasant', price: 70, emoji: '⛳', rating: 4.7, reviews: 3, category: 'Golf Clubs', available: true, description: 'Cleveland set with Clicgear push cart — skip the riding cart fee and enjoy the walk. Right-handed. Great condition, used maybe 10 times. Conveniently located near Dunes West and Patriots Point.', rules: ['Return cart folded', 'Clean clubs before return'] },
};

export default function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = ALL_LISTINGS[id];
  const [step, setStep] = useState<'detail' | 'book' | 'confirmed'>('detail');
  const [form, setForm] = useState({ name: '', email: '', phone: '', startDate: '', endDate: '', message: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const days = (() => {
    if (!form.startDate || !form.endDate) return 1;
    const diff = (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000;
    return Math.max(1, Math.round(diff));
  })();

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: 6, display: 'block', letterSpacing: '0.02em',
  };

  if (!listing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Request sent to {listing.owner}!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
            We've notified {listing.owner} of your request. They'll confirm within a few hours and reach out to {form.email} with pickup details.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            No payment is charged until {listing.owner} confirms.
          </p>
          <Link href="/browse" style={{ background: 'var(--ocean)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Browse more gear
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px', textDecoration: 'none' }}>
            tide<span style={{ color: 'var(--sand)' }}>share</span>
          </Link>
          <Link href="/browse" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>← Back to browse</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

          {/* Left — listing detail */}
          <div>
            {/* Hero image */}
            <div style={{ height: 280, background: 'linear-gradient(135deg, var(--ocean-light), var(--bg-subtle))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, marginBottom: 28, border: '1px solid var(--border)' }}>
              {listing.emoji}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.3px' }}>{listing.title}</h1>
              {!listing.available && (
                <span style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>Unavailable</span>
              )}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>
              📍 {listing.location} · ⭐ {listing.rating} ({listing.reviews} reviews)
            </p>

            {/* Owner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                {listing.owner[0]}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Listed by {listing.owner}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>TideShare local since {listing.ownerSince}</p>
              </div>
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>About this gear</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>{listing.description}</p>

            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Ground rules</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {listing.rules.map((rule: string) => (
                <li key={rule} style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--ocean)', fontWeight: 700, flexShrink: 0 }}>·</span>
                  {rule}
                </li>
              ))}
            </ul>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontWeight: 800, color: 'var(--ocean)' }}>${Math.round(listing.price * days * 1.15)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => listing.available && setStep('book')}
                    disabled={!listing.available}
                    style={{ width: '100%', padding: '14px', borderRadius: 8, background: listing.available ? 'var(--ocean)' : 'var(--border)', color: listing.available ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: listing.available ? 'pointer' : 'not-allowed' }}>
                    {listing.available ? 'Request to book' : 'Currently unavailable'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    No charge until {listing.owner} confirms
                  </p>
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
                    <label style={labelStyle}>Message to {listing.owner} (optional)</label>
                    <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                      placeholder={`Hi ${listing.owner}, I'd love to rent your ${listing.title}...`}
                      value={form.message} onChange={e => set('message', e.target.value)} />
                  </div>

                  {form.startDate && form.endDate && (
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 14px', fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>Total due at confirm</span>
                        <span style={{ fontWeight: 800, color: 'var(--ocean)' }}>${Math.round(listing.price * days * 1.15)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => form.name && form.email && form.phone && setStep('confirmed')}
                    disabled={!form.name || !form.email || !form.phone}
                    style={{ width: '100%', padding: '14px', borderRadius: 8, background: form.name && form.email && form.phone ? 'var(--ocean)' : 'var(--border)', color: form.name && form.email && form.phone ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: form.name && form.email && form.phone ? 'pointer' : 'not-allowed' }}>
                    Send booking request →
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
