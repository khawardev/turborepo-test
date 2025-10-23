import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl;
  if (!accessToken) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/brands', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - assets in public folder
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|file.svg|globe.svg|next.svg|placeholder.svg|vercel.svg|window.svg).*)',
  ],
};