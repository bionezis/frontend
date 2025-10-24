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

  // Check for authentication token
  const token = request.cookies.get('access_token')?.value;

  // Define auth pages (login, register)
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.some((page) =>
    pathname.includes(page)
  );

  // Define protected routes (everything except auth pages and public routes)
  const publicRoutes = ['/', ...authPages];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.endsWith(route) || pathname === `/${request.nextUrl.pathname.split('/')[1]}`
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

  // Apply intl middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

