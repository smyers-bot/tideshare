import Link from 'next/link';

export default function PrivacyPage() {
  const section = (title: string, body: string) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>{body}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ocean)', letterSpacing: '-0.5px', textDecoration: 'none' }}>
            tide<span style={{ color: 'var(--sand)' }}>share</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40 }}>Last updated: September 2026</p>

        {section('Information We Collect', 'When you use TideShare, we collect information you provide directly: your name, email address, phone number, and payment information when you make a booking or submit a listing. We also collect basic usage data such as pages visited and actions taken on the site.')}

        {section('How We Use Your Information', 'We use your information to: process bookings and payments; send booking confirmation and notification emails; contact you about your listings or rentals; improve the TideShare platform. We do not sell your personal information to third parties.')}

        {section('Payment Processing', 'All payments are processed by Stripe. TideShare does not store your full credit card number. Stripe\'s privacy policy governs the handling of your payment information. You can review it at stripe.com/privacy.')}

        {section('Email Communications', 'By submitting a listing or booking request, you agree to receive transactional emails related to your activity on TideShare. We use EmailJS to send these notifications. We do not send marketing emails without your consent.')}

        {section('Information Sharing', 'When a booking is made, we share your name, email, and phone number with the gear Owner so they can coordinate pickup. Owners\' contact information may be shared with Renters for the same reason. We do not share your information with any other third parties except as required by law.')}

        {section('Data Retention', 'We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by emailing hello@tideshare.app.')}

        {section('Cookies', 'TideShare uses minimal cookies necessary for the site to function. We do not use tracking or advertising cookies.')}

        {section('Children\'s Privacy', 'TideShare is not intended for use by anyone under 18 years of age. We do not knowingly collect information from minors.')}

        {section('Changes to This Policy', 'We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on the site. Continued use of TideShare after changes constitutes acceptance of the updated policy.')}

        {section('Contact', 'Questions about your privacy? Email us at hello@tideshare.app.')}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginTop: 16 }}>
          <Link href="/" style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Back to TideShare</Link>
        </div>
      </div>
    </div>
  );
}
