'use client';
import Link from 'next/link';
import { useState } from 'react';

const ALL_LISTINGS = [
  { id: 1, title: 'Soft-top Surfboard', owner: 'Jake', location: 'Folly Beach', price: 45, emoji: '🏄', rating: 4.9, reviews: 23, category: 'Surfboards', available: true },
  { id: 2, title: 'Street-legal Golf Cart', owner: 'Mary', location: 'Isle of Palms', price: 120, emoji: '🛻', rating: 5.0, reviews: 11, category: 'Golf Carts', available: true },
  { id: 3, title: 'Tandem Kayak', owner: 'Chris', location: "Sullivan's Island", price: 65, emoji: '🚣', rating: 4.8, reviews: 17, category: 'Kayaks', available: true },
  { id: 4, title: 'Beach Chair + Umbrella Set', owner: 'Dana', location: 'Folly Beach', price: 25, emoji: '🏖️', rating: 4.7, reviews: 31, category: 'Beach Chairs', available: true },
  { id: 5, title: 'Paddleboard (11ft)', owner: 'Sam', location: 'Isle of Palms', price: 55, emoji: '🏄‍♀️', rating: 4.9, reviews: 8, category: 'Paddleboards', available: true },
  { id: 6, title: 'Beach Cruiser Bikes (2)', owner: 'Tara', location: 'Folly Beach', price: 35, emoji: '🚲', rating: 4.6, reviews: 19, category: 'Bikes', available: false },
  { id: 7, title: '4-seat Golf Cart', owner: 'Rob', location: 'Isle of Palms', price: 150, emoji: '🛻', rating: 4.8, reviews: 6, category: 'Golf Carts', available: true },
  { id: 8, title: 'Single Kayak', owner: 'Lisa', location: 'Folly Beach', price: 40, emoji: '🚣', rating: 4.9, reviews: 12, category: 'Kayaks', available: true },
  { id: 9, title: 'Snorkel Set', owner: 'Mike', location: "Sullivan's Island", price: 18, emoji: '🤿', rating: 4.5, reviews: 7, category: 'Snorkel Gear', available: true },
  { id: 10, title: 'Full Golf Club Set (RH)', owner: 'Brett', location: 'Kiawah Island', price: 60, emoji: '⛳', rating: 5.0, reviews: 9, category: 'Golf Clubs', available: true },
  { id: 11, title: 'Ladies Golf Club Set', owner: 'Anne', location: 'Wild Dunes', price: 50, emoji: '⛳', rating: 4.8, reviews: 5, category: 'Golf Clubs', available: true },
  { id: 12, title: 'Golf Club Set + Push Cart', owner: 'Dave', location: 'Mount Pleasant', price: 70, emoji: '⛳', rating: 4.7, reviews: 3, category: 'Golf Clubs', available: true },
];

const LOCATIONS = ['All locations', 'Folly Beach', 'Isle of Palms', "Sullivan's Island", 'Kiawah Island', 'Wild Dunes', 'Mount Pleasant'];
const CATEGORIES = ['All gear', 'Surfboards', 'Golf Carts', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Snorkel Gear'];

export default function BrowsePage() {
  const [location, setLocation] = useState('All locations');
  const [category, setCategory] = useState('All gear');
  const [maxPrice, setMaxPrice] = useState(200);

  const filtered = ALL_LISTINGS.filter(l => {
    if (location !== 'All locations' && l.location !== location) return false;
    if (category !== 'All gear' && l.category !== category) return false;
    if (l.price > maxPrice) return false;
    return true;
  });

  const selectStyle = {
    padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text)', fontSize: 14, outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px', textDecoration: 'none' }}>
            tide<span style={{ color: 'var(--sand)' }}>share</span>
          </Link>
          <Link href="/list" style={{ background: 'var(--ocean)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            List your gear
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.3px' }}>
          Browse gear in Charleston
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <select style={selectStyle} value={location} onChange={e => setLocation(e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Max ${maxPrice}/day</span>
            <input type="range" min={10} max={200} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: 100, accentColor: 'var(--ocean)' }} />
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏖️</div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No gear matches your filters</p>
            <p style={{ fontSize: 15 }}>Try adjusting your location or category.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(listing => (
              <Link key={listing.id} href={`/gear/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', opacity: listing.available ? 1 : 0.6 }}>
                  <div style={{ height: 160, background: 'linear-gradient(135deg, var(--ocean-light), var(--bg-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                    {listing.emoji}
                    {!listing.available && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 6 }}>Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{listing.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{listing.owner} · {listing.location}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
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
        )}
      </div>
    </div>
  );
}
