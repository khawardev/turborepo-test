import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRequest } from "@/server/api/authRequest";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authPaths = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
    ];

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // If no tokens and route is auth → allow access
    if ((!accessToken || !refreshToken) && authPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // If no tokens and route is auth → redirect to login
    if (!accessToken || !refreshToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    let user = null;
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;
    let response = NextResponse.next();

    // Try validating current access token
    try {
        user = await authRequest("/users/me/", "GET", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch {
        // If access token invalid → try refreshing tokens
        try {
            const refreshResponse = await authRequest("/refresh-token", "POST", {
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            newAccessToken = refreshResponse.access_token;
            newRefreshToken = refreshResponse.refresh_token;

            // Update cookies if refreshed
            if (newAccessToken && newRefreshToken) {
                response.cookies.set("access_token", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                });
                response.cookies.set("refresh_token", newRefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                });
            }
            
            // Retry user fetch with new access token
            user = await authRequest("/users/me/", "GET", {
                headers: { Authorization: `Bearer ${newAccessToken}` },
            });
        } catch {
            // If refresh also fails → redirect to login
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            return res;
        }
    }

    // If user is logged in and trying to access auth route → redirect to home
    if (user && authPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};