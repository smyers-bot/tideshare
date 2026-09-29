'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import NavBar from '@/app/components/NavBar';
import { track } from '@vercel/analytics';

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
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [locationTouched, setLocationTouched] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    title: '', category: '', location: '', price: '',
    description: '', availability: '',
    fulfillment: 'pickup', deliveryRadius: '', deliveryFee: '',
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
      setEmailVerified(!!data.user.email_confirmed_at || data.user.app_metadata?.provider === 'google');
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
    if (uploadedPhotoUrl) return uploadedPhotoUrl;
    const supabase = createClient();
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('listings').upload(path, photoFile, { cacheControl: '3600', upsert: false });
    if (error) throw new Error('Photo upload failed: ' + error.message);
    const { data } = supabase.storage.from('listings').getPublicUrl(path);
    setUploadedPhotoUrl(data.publicUrl);
    return data.publicUrl;
  };

  const generateWithAI = async () => {
    if (!photoFile) return;
    setAiGenerating(true);
    try {
      // Upload photo first to get a public URL (avoids mobile HEIC/base64 issues)
      const imageUrl = await uploadPhoto();
      if (!imageUrl) throw new Error('Photo upload failed');
      const res = await fetch('/api/describe-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
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

  const priceNum = parseFloat(form.price);
  const priceError = form.price && (priceNum < 5 || priceNum > 500) ? 'Price must be between $5 and $500/day.' : '';
  const depositNum = parseFloat(depositAmount);
  const depositError = depositAmount && (depositNum < 0 || depositNum > 2000) ? 'Deposit must be between $0 and $2,000.' : '';
  const deliveryFeeNum = parseFloat(form.deliveryFee);
  const deliveryFeeError = form.fulfillment === 'delivery' && form.deliveryFee && (deliveryFeeNum < 0 || deliveryFeeNum > 500) ? 'Delivery fee must be between $0 and $500.' : '';
  const missingFields = [
    !form.name && 'Your name',
    !form.email && 'Email',
    !form.title && 'Gear title',
    !form.category && 'Category',
    !form.location && 'Location',
    !form.price && 'Daily price',
  ].filter(Boolean) as string[];
  const canSubmit = missingFields.length === 0 && !priceError && !depositError && !deliveryFeeError && emailVerified;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Listing submitted!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
            Your listing is live and renters can request it immediately. You'll get an email when someone books. Track everything from your dashboard.
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
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 15 }}>Takes 5 minutes. Your listing goes live immediately.</p>

        <button
          type="button"
          onClick={() => document.getElementById('photo-upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center', background: 'var(--surface)', border: '1px dashed var(--ocean)', borderRadius: 12, padding: 16, marginBottom: 32, cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ fontSize: 26 }}>✨</span>
          <span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Fastest way to list: snap a photo first</span>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)' }}>We'll write the title, category, and description for you — jump to photo upload ↓</span>
          </span>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="owner-name" style={labelStyle}>Your name</label>
              <input id="owner-name" style={inputStyle} placeholder="Your first name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label htmlFor="owner-phone" style={labelStyle}>Phone (optional)</label>
              <input id="owner-phone" style={inputStyle} placeholder="(843) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="owner-email" style={labelStyle}>Email</label>
            <input id="owner-email" style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <label htmlFor="gear-title" style={labelStyle}>What are you listing?</label>
            <input
              id="gear-title"
              style={{ ...inputStyle, borderColor: (titleTouched || submitAttempted) && !form.title ? '#ef4444' : undefined }}
              placeholder="Soft-top surfboard, 7ft"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onBlur={() => setTitleTouched(true)}
              autoComplete="off"
              name="gear-title"
            />
            {(titleTouched || submitAttempted) && !form.title && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>Gear title is required.</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="gear-category" style={labelStyle}>Category</label>
              <select
                id="gear-category"
                style={{ ...inputStyle, borderColor: (categoryTouched || submitAttempted) && !form.category ? '#ef4444' : undefined }}
                value={form.category}
                onChange={e => set('category', e.target.value)}
                onBlur={() => setCategoryTouched(true)}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {(categoryTouched || submitAttempted) && !form.category && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>Category is required.</p>
              )}
            </div>
            <div>
              <label htmlFor="gear-location" style={labelStyle}>Your location</label>
              <select
                id="gear-location"
                style={{ ...inputStyle, borderColor: (locationTouched || submitAttempted) && !form.location ? '#ef4444' : undefined }}
                value={form.location}
                onChange={e => set('location', e.target.value)}
                onBlur={() => setLocationTouched(true)}>
                <option value="">Select...</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
              {(locationTouched || submitAttempted) && !form.location && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>Location is required.</p>
              )}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
                <div>
                  <label htmlFor="delivery-radius" style={labelStyle}>Max delivery radius (miles)</label>
                  <input id="delivery-radius" style={inputStyle} type="number" placeholder="10" value={form.deliveryRadius} onChange={e => set('deliveryRadius', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="delivery-fee" style={labelStyle}>Delivery fee</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                    <input id="delivery-fee" style={{ ...inputStyle, paddingLeft: 28, borderColor: deliveryFeeError ? '#ef4444' : undefined }} type="number" placeholder="20" min="0" max="500" autoComplete="off" name="delivery-fee" value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} />
                  </div>
                  {deliveryFeeError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{deliveryFeeError}</p>}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="gear-price" style={labelStyle}>Daily price (you keep 85%)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input
                id="gear-price"
                style={{ ...inputStyle, paddingLeft: 28, borderColor: priceError || ((priceTouched || submitAttempted) && !form.price) ? '#ef4444' : undefined }}
                type="number" placeholder="45" min="5" max="500"
                autoComplete="off"
                onBlur={() => setPriceTouched(true)}
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            {priceError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{priceError}</p>}
            {!priceError && (priceTouched || submitAttempted) && !form.price && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>Daily price is required.</p>
            )}
            {!priceError && !((priceTouched || submitAttempted) && !form.price) && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>$5 minimum · $500 maximum</p>}
          </div>

          <div>
            <label htmlFor="deposit-security-x" style={labelStyle}>Security deposit (optional)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input
                style={{ ...inputStyle, paddingLeft: 28, borderColor: depositError ? '#ef4444' : undefined }}
                type="text" inputMode="numeric" pattern="[0-9]*" placeholder="100"
                autoComplete="new-password" name="deposit-security-x" id="deposit-security-x"
                value={depositAmount}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setDepositAmount(raw);
                }} />
            </div>
            {depositError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{depositError}</p>}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>A card authorization hold — not a charge — placed on the renter's card after they pay. After return, release it from your dashboard (hold is voided, renter never charged) or claim it if gear is damaged. Holds auto-expire after 7 days if you take no action. Max $2,000.</p>
          </div>

          <div>
            <label htmlFor="gear-description" style={labelStyle}>Description (optional)</label>
            <textarea id="gear-description" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Condition, what's included, pickup instructions..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div>
            <label htmlFor="gear-availability" style={labelStyle}>Availability (optional)</label>
            <input id="gear-availability" style={inputStyle} placeholder="Weekends only, or most days May–Sept" value={form.availability} onChange={e => set('availability', e.target.value)} />
          </div>

          <div id="photo-upload-section">
            <label style={labelStyle}>Photo of your gear (optional but recommended)</label>
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', position: 'relative', display: 'block', width: '100%', fontFamily: 'inherit' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Tap to upload a photo</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>A clear photo of your actual gear, in good light — JPG or PNG, max 10MB</p>
                </>
              )}
            </button>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
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

          {!emailVerified && (
            <p style={{ fontSize: 13, color: '#713F12', background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, padding: '10px 14px' }}>
              ✉️ Please verify your email address before listing gear. Check your inbox, or use the "Resend email" button at the top of the page.
            </p>
          )}

          {submitAttempted && missingFields.length > 0 && (
            <p style={{ fontSize: 13, color: '#ef4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
              Please fill in: {missingFields.join(', ')}.
            </p>
          )}

          <button
            onClick={async () => {
              setSubmitAttempted(true);
              if (!canSubmit) return;
              setSending(true);
              try {
                setUploading(true);
                const photoUrl = await uploadPhoto();
                setUploading(false);

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/auth/signin?next=/list'); return; }
                if (!user.email_confirmed_at && user.app_metadata?.provider !== 'google') {
                  throw new Error('Please verify your email address before listing gear.');
                }

                const stripeAccountId = user.user_metadata?.stripe_account_id || '';
                const { error: dbError } = await supabase.from('listings').insert({
                  user_id: user.id,
                  stripe_account_id: stripeAccountId || undefined,
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
                  deposit_amount: depositAmount ? parseFloat(depositAmount) : 0,
                  fulfillment_type: form.fulfillment,
                  delivery_radius: form.fulfillment === 'delivery' ? parseInt(form.deliveryRadius) || 0 : 0,
                  delivery_fee: form.fulfillment === 'delivery' ? parseFloat(form.deliveryFee) || 0 : 0,
                });
                if (dbError) throw new Error(dbError.message);

                await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'new_listing',
                    ownerName: form.name,
                    ownerEmail: form.email,
                    ownerPhone: form.phone || '',
                    title: form.title,
                    category: form.category,
                    location: form.location,
                    price: form.price,
                    description: form.description || '',
                    photoUrl: photoUrl || '',
                  }),
                });

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
            Free to list · 15% fee only when you earn · Cancel listings any time
          </p>
        </div>
      </div>
    </div>
  );
}
