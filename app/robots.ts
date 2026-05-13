import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/fitness',
          '/expenses',
          '/habits',
          '/insights',
          '/settings',
          '/billing',
          '/notifications',
          '/onboarding',
          '/api/',
        ],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    // NOTE: host field removed — not valid in MetadataRoute.Robots
    // and was causing sitemap.xml crawl failures
  };
}
