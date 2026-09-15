import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TideShare — Rent gear from locals in Charleston',
  description: 'Borrow surfboards, golf carts, kayaks, and more from Charleston locals. Better prices, real people.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
