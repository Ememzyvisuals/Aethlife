import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PATHS = [
  '/dashboard', '/fitness', '/expenses', '/budget',
  '/habits', '/insights', '/settings', '/billing',
  '/notifications', '/onboarding', '/feedback',
];
const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    pathname === '/manifest.json' || pathname === '/sw.js' || pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Security headers
  const headers: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/callback')) {
    headers['Cache-Control'] = 'no-store';
  }

  Object.entries(headers).forEach(([k, v]) => supabaseResponse.headers.set(k, v));

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
