import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tideshare.app'),
  title: 'TideShare — Rent Beach & Outdoor Gear in Charleston SC',
  description: 'Rent surfboards, kayaks, paddleboards, bikes and golf clubs from Charleston locals. Better prices than shops — Folly Beach, Isle of Palms, Kiawah Island.',
  keywords: 'surfboard rental Charleston SC, kayak rental Isle of Palms, paddleboard rental Folly Beach, beach gear rental Charleston, bike rental Sullivan\'s Island, golf club rental Kiawah Island',
  openGraph: {
    title: 'TideShare — Rent Beach & Outdoor Gear in Charleston SC',
    description: 'Rent surfboards, kayaks, paddleboards, bikes and beach gear from locals across the Charleston area.',
    url: 'https://tideshare.app',
    siteName: 'TideShare',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TideShare — Rent Beach & Outdoor Gear in Charleston SC',
    description: 'Rent surfboards, kayaks, paddleboards, bikes and beach gear from locals across the Charleston area.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
