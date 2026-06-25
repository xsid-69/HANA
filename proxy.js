import { NextResponse } from 'next/server'

// Route prefixes that require an authenticated user (client OR companion).
const PROTECTED_PREFIXES = [
  '/home',
  '/discover',
  '/bookings',
  '/messages',
  '/profile',
  '/onboarding',
  '/companion/dashboard',
  '/companion/calendar',
  '/companion/earnings',
  '/companion/bookings',
  '/companion/messages',
  '/companion/profile',
]

// Cookies that indicate a logged-in user. We honor BOTH auth systems:
//  - hana-token: the custom JWT (email/password + register)
//  - authjs/next-auth session cookies: NextAuth (Google + magic link)
// We only check for presence here (a lightweight gate). Full verification
// still happens in server actions, so a stale cookie never grants real access
// but also never causes a surprise redirect mid-process.
const AUTH_COOKIES = [
  'hana-token',
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
]

function isAuthenticated(request) {
  return AUTH_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value))
}

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

export function proxy(request) {
  const { pathname } = request.nextUrl
  const authed = isAuthenticated(request)

  // Block unauthenticated access to essential routes.
  if (isProtectedPath(pathname) && !authed) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Keep logged-in users out of the login/register pages.
  if (authed && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*).*)'],
}
