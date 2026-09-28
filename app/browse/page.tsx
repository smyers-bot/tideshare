'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NavBar from '@/app/components/NavBar';


const LOCATIONS = ['All locations', 'Folly Beach', 'Isle of Palms', "Sullivan's Island", 'Kiawah Island', 'Wild Dunes', 'Mount Pleasant', 'James Island'];
const CATEGORIES = ['All gear', 'Bundles', 'Surfboards', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Fishing Gear', 'Camping Gear'];

export default function BrowsePage() {
  const [allListings, setAllListings] = useState<any[]>([]);
  const [location, setLocation] = useState('All locations');
  const [category, setCategory] = useState('All gear');
  const [maxPrice, setMaxPrice] = useState(150);
  const [sliderMax, setSliderMax] = useState(150);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) setCategory(params.get('category')!);
    if (params.get('location')) setLocation(params.get('location')!);

    fetch('/api/listings')
      .then(res => res.json())
      .then(({ listings, error }) => {
        const data = (!error && listings) ? listings : [];
        setAllListings(data);
        const highest = Math.max(...data.map((l: any) => l.price ?? 0));
        const cap = Math.ceil(highest / 10) * 10 + 20;
        setSliderMax(cap);
        setMaxPrice(cap);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (location !== 'All locations') params.set('location', location);
    if (category !== 'All gear') params.set('category', category);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [location, category]);

  const filtered = allListings.filter(l => {
    if (location !== 'All locations' && l.location !== location) return false;
    if (category !== 'All gear' && l.category !== category) return false;
    if (l.price > maxPrice) return false;
    return true;
  });
  const availableCount = filtered.filter(l => l.is_active !== false).length;

  const selectStyle = {
    padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text)', fontSize: 14, outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.3px' }}>
          Browse gear in Charleston
        </h1>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <select style={selectStyle} value={location} onChange={e => setLocation(e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Max ${maxPrice}/day</span>
            <input type="range" min={10} max={sliderMax} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: 100, accentColor: 'var(--ocean)' }} />
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {availableCount} listing{availableCount !== 1 ? 's' : ''}
          </span>
        </div>

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
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', opacity: listing.is_active ? 1 : 0.6 }}>
                  <div style={{ height: 160, background: listing.photo_url ? 'none' : 'linear-gradient(135deg, var(--ocean-light), var(--bg-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative', overflow: 'hidden' }}>
                    {listing.photo_url
                      ? <img src={listing.photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : listing.emoji}
                    {!listing.is_active && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 6 }}>Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{listing.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{listing.owner_name} · {listing.location}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ocean)' }}>${listing.price}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/day</span>
                      </div>
                      {listing.reviews_count > 0
                        ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⭐ {listing.rating} ({listing.reviews_count})</span>
                        : <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ocean)', background: 'var(--ocean-light)', padding: '2px 8px', borderRadius: 6 }}>New</span>}
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
