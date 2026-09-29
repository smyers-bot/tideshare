import { createAdminClient } from '@/app/lib/supabase/admin';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://tideshare.app';
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/browse`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/owners`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/list`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('listings')
      .select('id, created_at')
      .eq('is_approved', true)
      .eq('is_active', true);
    if (data) {
      listingPages = data.map(l => ({
        url: `${base}/gear/${l.id}`,
        lastModified: l.created_at ? new Date(l.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {}

  return [...staticPages, ...listingPages];
}
