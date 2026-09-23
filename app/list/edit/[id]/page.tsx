'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import NavBar from '@/app/components/NavBar';

const CATEGORIES = ['Surfboards', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Fishing Gear', 'Camping Gear', 'Bundles', 'Other'];
const LOCATIONS = ['Folly Beach', 'Isle of Palms', "Sullivan's Island", 'Kiawah Island', 'Wild Dunes', 'James Island', 'Mount Pleasant', 'Downtown Charleston'];
const CATEGORY_EMOJI: Record<string, string> = {
  Surfboards: '🏄', Kayaks: '🚣', Paddleboards: '🏄‍♀️', 'Golf Clubs': '⛳',
  'Beach Chairs': '🏖️', Bikes: '🚲', 'Fishing Gear': '🎣', 'Camping Gear': '⛺',
  Bundles: '🎉', Other: '📦',
};

export default function EditListingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    title: '', category: '', location: '', price: '',
    description: '', availability: '',
    fulfillment: 'pickup', deliveryRadius: '', deliveryFee: '', deposit: '',
  });

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/signin?next=/dashboard'); return; }

      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !listing) { router.push('/dashboard'); return; }
      if (listing.user_id !== user.id) { router.push('/dashboard'); return; }

      setCurrentPhotoUrl(listing.photo_url || '');
      setForm({
        name: listing.owner_name || '',
        email: listing.owner_email || '',
        phone: listing.owner_phone || '',
        title: listing.title || '',
        category: listing.category || '',
        location: listing.location || '',
        price: listing.price?.toString() || '',
        description: listing.description || '',
        availability: listing.availability || '',
        fulfillment: listing.fulfillment_type || 'pickup',
        deliveryRadius: listing.delivery_radius?.toString() || '',
        deliveryFee: listing.delivery_fee?.toString() || '',
        deposit: listing.deposit_amount?.toString() || '',
      });
      setLoading(false);
    }
    load();
  }, [id]);

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

  const handleSave = async () => {
    if (!form.title || !form.category || !form.location || !form.price) return;
    setSaving(true);
    try {
      const photoUrl = await uploadPhoto();
      const supabase = createClient();
      const { error } = await supabase.from('listings').update({
        title: form.title,
        category: form.category,
        location: form.location,
        price: parseFloat(form.price),
        description: form.description || '',
        availability: form.availability || '',
        owner_name: form.name,
        owner_email: form.email,
        owner_phone: form.phone || '',
        emoji: CATEGORY_EMOJI[form.category] || '📦',
        deposit_amount: form.deposit ? parseFloat(form.deposit) : 0,
        fulfillment_type: form.fulfillment,
        delivery_radius: form.fulfillment === 'delivery' ? parseInt(form.deliveryRadius) || 0 : 0,
        delivery_fee: form.fulfillment === 'delivery' ? parseFloat(form.deliveryFee) || 0 : 0,
        ...(photoUrl ? { photo_url: photoUrl } : {}),
      }).eq('id', id);
      if (error) throw new Error(error.message);
      router.push('/dashboard');
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from('listings').delete().eq('id', id);
      router.push('/dashboard');
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
      setDeleting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: 6, display: 'block', letterSpacing: '0.02em',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  const displayPhoto = photoPreview || currentPhotoUrl || null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.3px' }}>Edit listing</h1>
            <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to dashboard</Link>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            {deleting ? 'Deleting...' : 'Delete listing'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <label style={labelStyle}>What are you listing?</label>
            <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} />
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
                  <input style={inputStyle} type="number" value={form.deliveryRadius} onChange={e => set('deliveryRadius', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Delivery fee</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                    <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Daily price (you keep 85%)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Security deposit (optional)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
              <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Availability (optional)</label>
            <input style={inputStyle} value={form.availability} onChange={e => set('availability', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>
              {currentPhotoUrl && !photoPreview ? 'Photo — tap to replace' : 'Photo of your gear'}
            </label>
            <label htmlFor="photo-upload-edit" style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', display: 'block' }}>
              {displayPhoto ? (
                <img src={displayPhoto} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Tap to upload a photo</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>JPG or PNG, max 10MB</p>
                </>
              )}
              <input id="photo-upload-edit" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
            {photoPreview && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <button
                  onClick={generateWithAI}
                  disabled={aiGenerating}
                  style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: aiGenerating ? 'var(--border)' : 'var(--ocean)', border: 'none', borderRadius: 7, padding: '8px 14px', cursor: aiGenerating ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {aiGenerating ? '✨ Writing listing...' : '✨ Rewrite with AI'}
                </button>
                <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Cancel new photo
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.category || !form.location || !form.price}
            style={{ padding: '14px', borderRadius: 8, background: 'var(--ocean)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>
            {saving ? 'Saving...' : 'Save changes →'}
          </button>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Changes go live immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
