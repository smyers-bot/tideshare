import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 48px', marginBottom: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px', marginBottom: 6 }}>
              tide<span style={{ color: 'var(--sand)' }}>share</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Gear rental marketplace · Charleston, SC</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Renters</span>
              <Link href="/browse" style={linkStyle}>Browse gear</Link>
              <Link href="/browse?category=Surfboards" style={linkStyle}>Surfboards</Link>
              <Link href="/browse?category=Kayaks" style={linkStyle}>Kayaks</Link>
              <Link href="/browse?category=Golf+Clubs" style={linkStyle}>Golf clubs</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Owners</span>
              <Link href="/owners" style={linkStyle}>Rent out gear</Link>
              <Link href="/list" style={linkStyle}>List your gear</Link>
              <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company</span>
              <Link href="/terms" style={linkStyle}>Terms of Service</Link>
              <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
              <a href="mailto:hello@tideshare.app" style={linkStyle}>Contact us</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: 13, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>© 2026 TideShare · Made in Charleston, SC 🌊</span>
          <span style={{ fontSize: 11, opacity: 0.5, fontFamily: 'monospace' }}>build {process.env.NEXT_PUBLIC_BUILD_TIME || 'dev'}</span>
        </div>
      </div>
    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-muted)',
  textDecoration: 'none',
};
