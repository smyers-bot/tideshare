'use client';
import Link from 'next/link';
import { useState } from 'react';

const CATEGORIES = ['Surfboards', 'Golf Carts', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Camping Gear', 'Snorkel Gear', 'Other'];
const LOCATIONS = ['Folly Beach', 'Isle of Palms', "Sullivan's Island", 'Kiawah Island', 'Wild Dunes', 'James Island', 'Mount Pleasant', 'Downtown Charleston'];

export default function ListPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    title: '', category: '', location: '', price: '',
    description: '', availability: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: 6, display: 'block', letterSpacing: '0.02em',
  };

  const canSubmit = form.name && form.email && form.title && form.category && form.location && form.price;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>You're on the list!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
            We'll reach out to {form.email} within 24 hours to get your listing live. In the meantime, spread the word — the more locals who list, the better for everyone.
          </p>
          <Link href="/" style={{ background: 'var(--ocean)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px', textDecoration: 'none' }}>
            tide<span style={{ color: 'var(--sand)' }}>share</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        {/* Earn callout */}
        <div style={{ background: 'var(--ocean-light)', border: '1px solid var(--ocean)', borderRadius: 12, padding: 20, marginBottom: 36, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 32 }}>💰</span>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--ocean)', marginBottom: 4 }}>Earn $200–$600/weekend</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Charleston gets 7M+ tourists a year. Your gear can pay for itself in one summer.
              Listing is free — TideShare takes 15% only when you earn.
            </p>
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>List your gear</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>Takes 5 minutes. We'll review and get it live within 24 hours.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input style={inputStyle} placeholder="Jake" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input style={inputStyle} placeholder="(843) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <label style={labelStyle}>What are you listing?</label>
            <input style={inputStyle} placeholder="Soft-top surfboard, 7ft" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Your location</label>
              <select style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)}>
                <option value="">Select...</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Daily price (you keep 85%)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" placeholder="45" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Condition, what's included, pickup instructions..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Availability (optional)</label>
            <input style={inputStyle} placeholder="Weekends only, or most days May–Sept" value={form.availability} onChange={e => set('availability', e.target.value)} />
          </div>

          <button onClick={() => setSubmitted(true)} disabled={!canSubmit}
            style={{ padding: '14px', borderRadius: 8, background: canSubmit ? 'var(--ocean)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', marginTop: 8 }}>
            Submit listing →
          </button>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Free to list · 15% fee only when you earn · Cancel any time
          </p>
        </div>
      </div>
    </div>
  );
}
