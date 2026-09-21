import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TideShare — Rent Beach & Outdoor Gear in Charleston SC',
  description: 'Rent surfboards, kayaks, paddleboards, bikes, golf clubs and beach gear from locals in Charleston, Isle of Palms, Folly Beach, Kiawah Island and Sullivan\'s Island. Better prices than shops.',
  keywords: 'surfboard rental Charleston SC, kayak rental Isle of Palms, paddleboard rental Folly Beach, beach gear rental Charleston, bike rental Sullivan\'s Island, golf club rental Kiawah Island',
  openGraph: {
    title: 'TideShare — Rent Beach & Outdoor Gear in Charleston SC',
    description: 'Rent surfboards, kayaks, paddleboards, bikes and beach gear from locals across the Charleston area.',
    url: 'https://tideshare.app',
    siteName: 'TideShare',
    type: 'website',
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
