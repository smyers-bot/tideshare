'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import emailjs from '@emailjs/browser';
import { createClient } from '@/app/lib/supabase/client';
import NavBar from '@/app/components/NavBar';
import { track } from '@vercel/analytics';

const EMAILJS_SERVICE = 'service_ssteci9';
const EMAILJS_TEMPLATE = 'template_9ylzhsa';
const EMAILJS_PUBLIC_KEY = 'mYya3x3YoyhvwzvYR';

const CATEGORIES = ['Surfboards', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Fishing Gear', 'Camping Gear', 'Bundles', 'Other'];
const LOCATIONS = ['Folly Beach', 'Isle of Palms', "Sullivan's Island", 'Kiawah Island', 'Wild Dunes', 'James Island', 'Mount Pleasant', 'Downtown Charleston'];
const CATEGORY_EMOJI: Record<string, string> = {
  Surfboards: '🏄', Kayaks: '🚣', Paddleboards: '🏄‍♀️', 'Golf Clubs': '⛳',
  'Beach Chairs': '🏖️', Bikes: '🚲', 'Fishing Gear': '🎣', 'Camping Gear': '⛺',
  Bundles: '🎉', Other: '📦',
};

export default function ListPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    title: '', category: '', location: '', price: '',
    description: '', availability: '',
    fulfillment: 'pickup', deliveryRadius: '', deliveryFee: '', deposit: '',
  });
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/signin?next=/list'); return; }
      const name = data.user.user_metadata?.full_name || '';
      const email = data.user.email || '';
      setUserEmail(email);
      setForm(f => ({ ...f, name, email }));
    });
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    const supabase = createClient();
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('listings').upload(path, photoFile, { cacheControl: '3600', upsert: false });
    if (error) throw new Error('Photo upload failed: ' + error.message);
    const { data } = supabase.storage.from('listings').getPublicUrl(path);
    return data.publicUrl;
  };

  const generateWithAI = async () => {
    if (!photoFile) return;
    setAiGenerating(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });
      const res = await fetch('/api/describe-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: photoFile.type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm(f => ({
        ...f,
        title: data.title || f.title,
        category: data.category || f.category,
        description: data.description || f.description,
      }));
    } catch (err: any) {
      alert('AI generation failed: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Listing submitted!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
            Your listing is under review and will go live shortly. You can track it from your dashboard.
          </p>
          <Link href="/dashboard" style={{ background: 'var(--ocean)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Go to dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ background: 'var(--ocean-light)', border: '1px solid var(--ocean)', borderRadius: 12, padding: 20, marginBottom: 36, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 32 }}>💰</span>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--ocean)', marginBottom: 4 }}>Earn $200–$600/weekend</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Charleston gets 7M+ tourists a year. Listing is free — TideShare takes 15% only when you earn.
            </p>
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>List your gear</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>Takes 5 minutes. Your listing goes live after a quick review.</p>

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
            <label style={labelStyle}>How will renters get the gear?</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ val: 'pickup', label: '📍 Pickup only', desc: 'Renter comes to you' }, { val: 'delivery', label: '🚗 Delivery available', desc: 'You can bring it to them' }].map(opt => (
                <div key={opt.val} onClick={() => set('fulfillment', opt.val)}
                  style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: `2px solid ${form.fulfillment === opt.val ? 'var(--ocean)' : 'var(--border)'}`, background: form.fulfillment === opt.val ? 'var(--ocean-light)' : 'var(--surface)', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            {form.fulfillment === 'delivery' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label style={labelStyle}>Max delivery radius (miles)</label>
                  <input style={inputStyle} type="number" placeholder="10" value={form.deliveryRadius} onChange={e => set('deliveryRadius', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Delivery fee</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                    <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" placeholder="20" value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Daily price (you keep 85%)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" placeholder="45" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Security deposit (optional)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" placeholder="100" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>Collected at booking, returned within 48 hrs if no damage reported.</p>
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

          <div>
            <label style={labelStyle}>Photo of your gear (optional but recommended)</label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', position: 'relative' }}
              onClick={() => document.getElementById('photo-upload')?.click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Click to upload a photo</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>JPG or PNG, max 10MB</p>
                </>
              )}
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </div>
            {photoPreview && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <button
                  onClick={generateWithAI}
                  disabled={aiGenerating}
                  style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: aiGenerating ? 'var(--border)' : 'var(--ocean)', border: 'none', borderRadius: 7, padding: '8px 14px', cursor: aiGenerating ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {aiGenerating ? '✨ Writing listing...' : '✨ Write listing with AI'}
                </button>
                <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Remove photo
                </button>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              if (!canSubmit) return;
              setSending(true);
              try {
                setUploading(true);
                const photoUrl = await uploadPhoto();
                setUploading(false);

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/auth/signin?next=/list'); return; }

                const { error: dbError } = await supabase.from('listings').insert({
                  user_id: user.id,
                  title: form.title,
                  category: form.category,
                  location: form.location,
                  price: parseFloat(form.price),
                  description: form.description || '',
                  availability: form.availability || '',
                  photo_url: photoUrl || '',
                  owner_name: form.name,
                  owner_email: form.email,
                  owner_phone: form.phone || '',
                  emoji: CATEGORY_EMOJI[form.category] || '📦',
                  is_approved: true,
                  deposit_amount: form.deposit ? parseFloat(form.deposit) : 0,
                  fulfillment_type: form.fulfillment,
                  delivery_radius: form.fulfillment === 'delivery' ? parseInt(form.deliveryRadius) || 0 : 0,
                  delivery_fee: form.fulfillment === 'delivery' ? parseFloat(form.deliveryFee) || 0 : 0,
                });
                if (dbError) throw new Error(dbError.message);

                await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
                  name: form.name, email: form.email, phone: form.phone || 'Not provided',
                  title: form.title, category: form.category, location: form.location,
                  price: form.price, availability: form.availability || 'Not specified',
                  description: form.description || 'None', photo_url: photoUrl || 'No photo uploaded',
                }, EMAILJS_PUBLIC_KEY);

                track('listing_submitted', { category: form.category, location: form.location, price: parseFloat(form.price), fulfillment: form.fulfillment });
                setSubmitted(true);
              } catch (err: any) {
                alert('Error: ' + (err?.message || JSON.stringify(err)));
              } finally {
                setSending(false);
              }
            }}
            disabled={!canSubmit || sending}
            style={{ padding: '14px', borderRadius: 8, background: canSubmit ? 'var(--ocean)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--text-muted)', fontSize: 15, fontWeight: 700, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', marginTop: 8 }}>
            {uploading ? 'Uploading photo...' : sending ? 'Submitting...' : 'Submit listing →'}
          </button>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Free to list · 15% fee only when you earn · Cancel any time
          </p>
        </div>
      </div>
    </div>
  );
}
