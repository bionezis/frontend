import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an API route
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Apply intl middleware first for proper locale detection
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware redirected, return that response
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // Check for authentication token
  const token = request.cookies.get('access_token')?.value;

  // Define auth pages (login, register)
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.some((page) =>
    pathname.includes(page)
  );

  // If no token and trying to access protected route, redirect to login
  if (!token && !isAuthPage && !pathname.match(/^\/(en|pl|nl|fr|de|es)(\/|$)/)) {
    const locale = pathname.split('/')[1] || defaultLocale;
    const url = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(url);
  }

  // If has token and trying to access auth page, redirect to dashboard
  if (token && isAuthPage) {
    const locale = pathname.split('/')[1] || defaultLocale;
    const url = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};


