
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const accessToken = req.cookies.get('access_token')?.value;
    const url = req.nextUrl.clone();

    if (!accessToken) {
        if (url.pathname !== '/login' && url.pathname !== '/register') {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    } else {
        if (url.pathname === '/login' || url.pathname === '/register') {
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    const res = NextResponse.next();
    res.headers.set('x-pathname', req.nextUrl.pathname);
    return res;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
