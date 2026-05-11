import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all search engines to crawl public pages
        userAgent: '*',
        allow: [
          '/',
          '/auth/login',
          '/auth/signup',
          '/auth/forgot-password',
          '/legal/privacy',
          '/legal/terms',
        ],
        // Block all private/authenticated routes
        disallow: [
          '/dashboard',
          '/dashboard/',
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
      {
        // Explicitly welcome Googlebot
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/auth/login',
          '/auth/signup',
          '/legal/privacy',
          '/legal/terms',
        ],
        disallow: ['/api/', '/dashboard/'],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
