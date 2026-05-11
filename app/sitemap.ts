import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url;
  const now  = new Date().toISOString();

  return [
    // Homepage — highest priority
    {
      url:              base,
      lastModified:     now,
      changeFrequency: 'weekly',
      priority:         1.0,
    },
    // Auth pages
    {
      url:              `${base}/auth/signup`,
      lastModified:     now,
      changeFrequency: 'monthly',
      priority:         0.9,
    },
    {
      url:              `${base}/auth/login`,
      lastModified:     now,
      changeFrequency: 'monthly',
      priority:         0.8,
    },
    {
      url:              `${base}/auth/forgot-password`,
      lastModified:     now,
      changeFrequency: 'yearly',
      priority:         0.4,
    },
    // Legal pages
    {
      url:              `${base}/legal/privacy`,
      lastModified:     now,
      changeFrequency: 'yearly',
      priority:         0.3,
    },
    {
      url:              `${base}/legal/terms`,
      lastModified:     now,
      changeFrequency: 'yearly',
      priority:         0.3,
    },
  ];
}
