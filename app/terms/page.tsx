import Link from 'next/link';

export default function TermsPage() {
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
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40 }}>Last updated: September 2026</p>

        {section('1. TideShare is a Marketplace', 'TideShare connects gear owners ("Owners") with renters ("Renters") in the Charleston, SC area. TideShare is not a gear rental company. We do not own, inspect, or guarantee the condition of any listed gear. We provide the platform that facilitates transactions between independent parties.')}

        {section('2. Renter Responsibility', 'By completing a booking, Renters agree to: (a) use rented gear responsibly and only for its intended purpose; (b) return gear in the same condition it was received, normal wear excepted; (c) be liable for any damage, loss, or theft occurring during the rental period; (d) pay for repairs or replacement if gear is damaged beyond normal wear. Where the Owner has set a security deposit, TideShare places a card authorization hold on the Renter\'s card after payment is collected. This hold is not a charge. The Owner may release the hold from their dashboard (voiding it, so the Renter is never charged) or claim it if gear is returned damaged. Holds auto-expire after 7 days if the Owner takes no action. The deposit amount is disclosed in the listing.')}

        {section('3. Owner Responsibility', 'Owners agree to: (a) accurately represent the condition and contents of listed gear; (b) ensure gear is safe and fit for use; (c) honor confirmed bookings; (d) not list gear that requires a license or special certification without disclosing this prominently. Owners are solely responsible for their gear and any incidents arising from its use.')}

        {section('4. Payments and Fees', 'No payment is charged until the Owner confirms the booking. Upon confirmation, TideShare collects payment from the Renter and takes a 15% platform fee. Owners receive 85% of the listed price, paid out within 24 hours of rental completion. All payments are processed securely by Stripe. TideShare does not issue refunds after a rental begins. Cancellations made more than 48 hours before the rental start time receive a full refund. Cancellations within 48 hours are non-refundable.')}

        {section('5. Damage and Disputes', 'Damage disputes are between the Renter and Owner. TideShare may assist in mediation but is not obligated to do so and bears no financial responsibility for gear damage, loss, or personal injury. Renters who damage gear may be charged by Owners directly or through legal channels. TideShare may suspend accounts involved in damage disputes pending resolution.')}

        {section('6. Limitation of Liability', 'TideShare is not liable for: personal injury or property damage arising from use of rented gear; disputes between Owners and Renters; gear that does not match its listing; or any indirect, incidental, or consequential damages. Use of TideShare is at your own risk. Maximum liability to any user is limited to fees paid to TideShare in the 30 days preceding the claim.')}

        {section('7. Prohibited Items', 'The following may not be listed on TideShare: motorized vehicles (including golf carts, boats, and ATVs); weapons or dangerous equipment; items requiring a commercial license to operate; anything illegal under South Carolina or federal law.')}

        {section('8. Account Termination', 'TideShare reserves the right to suspend or terminate any account at any time for violations of these Terms, fraudulent activity, or behavior that harms other users or the platform.')}

        {section('9. Governing Law', 'These Terms are governed by the laws of the State of South Carolina. Any disputes shall be resolved in the courts of Charleston County, SC.')}

        {section('10. Contact', 'Questions about these Terms? Email us at hello@tideshare.app.')}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginTop: 16 }}>
          <Link href="/" style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Back to TideShare</Link>
        </div>
      </div>
    </div>
  );
}
