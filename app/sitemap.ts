import { createClient } from '@/app/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://tideshare.app';

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/owners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/list`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Hardcoded demo listings
  const hardcodedIds = Array.from({ length: 16 }, (_, i) => i + 1);
  const hardcodedPages: MetadataRoute.Sitemap = hardcodedIds.map(id => ({
    url: `${base}/gear/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Real listings from Supabase
  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('listings')
      .select('id, updated_at')
      .eq('is_approved', true)
      .eq('is_active', true);
    if (data) {
      dynamicPages = data.map(l => ({
        url: `${base}/gear/${l.id}`,
        lastModified: new Date(l.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {}

  return [...staticPages, ...hardcodedPages, ...dynamicPages];
}
