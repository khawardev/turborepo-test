import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from './server/actions/authActions';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const user = await getCurrentUser()
    
    if (!user) {
        if (
            pathname.startsWith('/login') ||
            pathname.startsWith('/register') ||
            pathname.startsWith('/forgot-password') ||
            pathname.startsWith('/reset-password')
        ) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password')
    ) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|file.svg|globe.svg|next.svg|placeholder.svg|vercel.svg|window.svg).*)',
    ],
};