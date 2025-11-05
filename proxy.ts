import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl;
  if (!accessToken) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) {
    return NextResponse.redirect(new URL('/ccba', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|file.svg|globe.svg|next.svg|placeholder.svg|vercel.svg|window.svg).*)',
  ],
};