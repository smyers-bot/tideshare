import type { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import GearDetailClient from './GearDetailClient';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const HARDCODED_META: Record<string, { title: string; location: string; price: number; category: string; description: string }> = {
  '1': { title: 'Soft-top Surfboard', location: 'Folly Beach', price: 45, category: 'Surfboards', description: 'Perfect beginner/intermediate 7ft soft-top surfboard. Comes with leash and wax.' },
  '2': { title: 'Tandem Paddleboard Set', location: 'Isle of Palms', price: 75, category: 'Paddleboards', description: 'Two 11ft paddleboards perfect for exploring Isle of Palms together.' },
  '3': { title: 'Tandem Kayak', location: "Sullivan's Island", price: 65, category: 'Kayaks', description: "Stable tandem kayak great for the Intracoastal or calm ocean paddling." },
  '4': { title: 'Beach Chair + Umbrella Set', location: 'Folly Beach', price: 25, category: 'Beach Chairs', description: '2 low-slung beach chairs and large umbrella. Folds into a carry bag.' },
  '5': { title: 'Paddleboard (11ft)', location: 'Isle of Palms', price: 55, category: 'Paddleboards', description: 'Solid epoxy 11ft paddleboard, great for flat water and light chop.' },
  '6': { title: 'Beach Cruiser Bikes (2)', location: 'Folly Beach', price: 35, category: 'Bikes', description: 'Two matching beach cruisers with baskets. Helmets included.' },
  '7': { title: 'Camping Gear Bundle', location: 'James Island', price: 55, category: 'Camping Gear', description: '4-person tent, sleeping bags, camp chairs, and a portable camp stove.' },
  '8': { title: 'Single Kayak', location: 'Folly Beach', price: 40, category: 'Kayaks', description: 'Nimble sit-on-top kayak, great for solo paddlers.' },
  '9': { title: 'Fishing Rod + Tackle Kit', location: "Sullivan's Island", price: 22, category: 'Fishing Gear', description: 'Medium-heavy spinning rod with reel, plus a full tackle kit.' },
  '10': { title: 'Full Golf Club Set (RH)', location: 'Kiawah Island', price: 60, category: 'Golf Clubs', description: 'Callaway Rogue ST irons, TaylorMade driver, full bag with 14 clubs. Right-handed.' },
  '11': { title: 'Ladies Golf Club Set', location: 'Wild Dunes', price: 50, category: 'Golf Clubs', description: 'Ping G Le3 ladies set, graphite shafts. Full bag.' },
  '12': { title: 'Golf Club Set + Push Cart', location: 'Mount Pleasant', price: 70, category: 'Golf Clubs', description: 'Cleveland set with Clicgear push cart. Right-handed.' },
  '13': { title: 'Beach Day Bundle', location: 'Folly Beach', price: 45, category: 'Bundles', description: '2 beach chairs, large shade umbrella, Spikeball set, and Kan Jam.' },
  '14': { title: 'Family Beach Bundle', location: 'Isle of Palms', price: 65, category: 'Bundles', description: '4 beach chairs, XL umbrella, 30qt cooler, cornhole, and Spikeball.' },
  '15': { title: 'Surf & Sand Bundle', location: 'Folly Beach', price: 75, category: 'Bundles', description: '7ft soft-top surfboard, 2 beach chairs, and a shade umbrella.' },
  '16': { title: 'Golf & Cooler Bundle', location: 'Kiawah Island', price: 80, category: 'Bundles', description: 'Full Callaway iron set, TaylorMade driver, and 30qt Yeti cooler.' },
};

async function getListing(id: string) {
  if (HARDCODED_META[id]) return HARDCODED_META[id];
  if (!UUID_RE.test(id)) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('listings').select('title, location, price, category, description').eq('id', id).single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: 'Gear Listing | TideShare' };

  const title = `Rent ${listing.title} in ${listing.location} — $${listing.price}/day | TideShare`;
  const description = `${listing.description} Rent locally in ${listing.location}, SC from a real person. Better prices than shops — book on TideShare.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tideshare.app/gear/${id}`,
      siteName: 'TideShare',
      type: 'website',
    },
  };
}

export default async function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);

  const jsonLd = listing ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'USD',
      priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      url: `https://tideshare.app/gear/${id}`,
      seller: { '@type': 'Organization', name: 'TideShare' },
    },
    areaServed: { '@type': 'Place', name: listing.location + ', SC' },
    category: listing.category,
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <GearDetailClient id={id} />
    </>
  );
}
