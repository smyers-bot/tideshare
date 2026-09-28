'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

function VerificationBanner({ email }: { email: string }) {
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  const resend = async () => {
    setSending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: 'signup', email });
    setResent(true);
    setSending(false);
  };

  return (
    <div style={{ background: '#FEF9C3', borderBottom: '1px solid #FDE047', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14, color: '#713F12', fontWeight: 500 }}>
        ✉️ Please verify your email address to use all features.
      </span>
      {resent ? (
        <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>✓ Email sent!</span>
      ) : (
        <button
          onClick={resend}
          disabled={sending}
          style={{ fontSize: 13, fontWeight: 700, color: '#713F12', background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {sending ? 'Sending…' : 'Resend email'}
        </button>
      )}
    </div>
  );
}

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 641);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const close = () => setMenuOpen(false);

  const emailUnverified = user && !user.email_confirmed_at && user.app_metadata?.provider !== 'google';

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: emailUnverified ? 'none' : '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" onClick={close} style={{ fontSize: 22, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px', textDecoration: 'none' }}>
          tide<span style={{ color: 'var(--sand)' }}>share</span>
        </Link>

        {isMobile ? (
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'opacity 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/browse" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Browse gear</Link>
            <Link href="/owners" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Rent out gear</Link>
            {user ? (
              <>
                <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                <button onClick={signOut} style={{ fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: 0 }}>Sign out</button>
              </>
            ) : (
              <Link href="/auth/signin" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            )}
            <Link href="/list" style={{ background: 'var(--ocean)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              List your gear
            </Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{ background: 'var(--ocean-light, #EFF8FF)', borderTop: '1px solid var(--border)', padding: '4px 20px 16px' }}>
          {[
            { href: '/browse', label: 'Browse gear' },
            { href: '/owners', label: 'Rent out gear' },
            ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={close} style={{ display: 'block', padding: '13px 0', fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              {label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { close(); signOut(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 0', fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign out
            </button>
          ) : (
            <Link href="/auth/signin" onClick={close} style={{ display: 'block', padding: '13px 0', fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              Sign in
            </Link>
          )}
          <div style={{ paddingTop: 14 }}>
            <Link href="/list" onClick={close} style={{ display: 'block', textAlign: 'center', background: 'var(--ocean)', color: '#fff', padding: '13px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.01em' }}>
              + List your gear
            </Link>
          </div>
        </div>
      )}

      {emailUnverified && <VerificationBanner email={user.email!} />}
    </nav>
  );
}
