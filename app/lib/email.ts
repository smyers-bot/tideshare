import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'TideShare <hello@tideshare.app>';
const ADMIN_EMAIL = 'thayes0327@gmail.com';

export async function sendBookingRequestEmail({
  ownerEmail, ownerName, renterName, renterEmail, renterPhone,
  gearTitle, gearPrice, startDate, endDate, total, message,
}: {
  ownerEmail: string; ownerName: string; renterName: string; renterEmail: string;
  renterPhone: string; gearTitle: string; gearPrice: number;
  startDate: string; endDate: string; total: number; message: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `New booking request for your ${gearTitle}`,
    html: `
      <h2>New booking request!</h2>
      <p>Hi ${ownerName}, someone wants to rent your <strong>${gearTitle}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;max-width:500px">
        <tr><td style="padding:8px 0;color:#666">Renter</td><td style="padding:8px 0;font-weight:600">${renterName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${renterEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${renterPhone}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Dates</td><td style="padding:8px 0">${startDate || 'Not specified'} – ${endDate || 'Not specified'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0;font-weight:700;color:#0ea5e9">$${total}</td></tr>
        ${message ? `<tr><td style="padding:8px 0;color:#666">Message</td><td style="padding:8px 0">${message}</td></tr>` : ''}
      </table>
      <p style="margin-top:24px"><a href="https://www.tideshare.app/dashboard" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">View in dashboard →</a></p>
      <p style="color:#999;font-size:12px;margin-top:32px">Log in to your TideShare dashboard to accept or decline.</p>
    `,
  });
}

export async function sendBookingApprovedEmail({
  renterEmail, renterName, ownerName, gearTitle, paymentUrl, startDate, endDate, total,
}: {
  renterEmail: string; renterName: string; ownerName: string; gearTitle: string;
  paymentUrl: string; startDate: string; endDate: string; total: number;
}) {
  return resend.emails.send({
    from: FROM,
    to: renterEmail,
    subject: `Your ${gearTitle} booking is confirmed — pay now to secure it`,
    html: `
      <h2>Great news, ${renterName}!</h2>
      <p><strong>${ownerName}</strong> accepted your request to rent the <strong>${gearTitle}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;max-width:500px">
        <tr><td style="padding:8px 0;color:#666">Dates</td><td style="padding:8px 0;font-weight:600">${startDate || 'As arranged'} – ${endDate || ''}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0;font-weight:700;color:#0ea5e9">$${total}</td></tr>
      </table>
      <p style="margin-top:24px"><a href="${paymentUrl}" style="background:#0ea5e9;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Pay now to secure your booking →</a></p>
      <p style="color:#666;font-size:13px;margin-top:16px">This payment link expires in 24 hours. No charge was made yet.</p>
      <p style="color:#999;font-size:12px;margin-top:32px">Questions? Reply to this email or contact ${ownerName} directly.</p>
    `,
  });
}

export async function sendNewListingEmail({
  ownerName, ownerEmail, ownerPhone, title, category, location, price, description, photoUrl, listingId,
}: {
  ownerName: string; ownerEmail: string; ownerPhone: string; title: string;
  category: string; location: string; price: string; description: string; photoUrl: string; listingId: string;
}) {
  const listingUrl = listingId ? `https://www.tideshare.app/gear/${listingId}` : '';
  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New listing submitted: ${title}`,
    html: `
      <h2>New gear listing submitted</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px">
        <tr><td style="padding:8px 0;color:#666">Owner</td><td style="padding:8px 0;font-weight:600">${ownerName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${ownerEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${ownerPhone || 'Not provided'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Title</td><td style="padding:8px 0;font-weight:600">${title}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Category</td><td style="padding:8px 0">${category}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Location</td><td style="padding:8px 0">${location}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Price</td><td style="padding:8px 0;font-weight:700">$${price}/day</td></tr>
        <tr><td style="padding:8px 0;color:#666">Description</td><td style="padding:8px 0">${description || 'None'}</td></tr>
        ${photoUrl ? `<tr><td style="padding:8px 0;color:#666">Photo</td><td style="padding:8px 0"><a href="${photoUrl}">View photo</a></td></tr>` : ''}
      </table>
      ${listingUrl ? `<p style="margin-top:20px"><a href="${listingUrl}" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">View live listing →</a></p>` : ''}
    `,
  });
}
