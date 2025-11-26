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
    const isDashboardPath = pathname.startsWith('/dashboard');

    let accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // No tokens
    if (!accessToken || !refreshToken) {
        if (isDashboardPath) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // With tokens, verify user
    let user = null;
    let response = NextResponse.next();

    try {
        user = await authRequest("/users/me/", "GET", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch (error) {
        // Assuming 401 or similar for invalid token, try to refresh
        try {
            const {success, data} = await authRequest("/refresh-token", "POST", {
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            const newAccessToken = data.access_token;
            const newRefreshToken = data.refresh_token;

            if (newAccessToken && newRefreshToken) {
                accessToken = newAccessToken;
                response.cookies.set("access_token", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
                response.cookies.set("refresh_token", newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
                
                // Retry user fetch with new access token
                user = await authRequest("/users/me/", "GET", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } else {
                throw new Error("Token refresh failed");
            }
        } catch {
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            return res;
        }
    }

    // User is logged in
    if (user) {
        if (authPaths.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL("/dashboard/ccba", request.url));
        }
        if (!isDashboardPath) {
             return NextResponse.redirect(new URL("/dashboard/ccba", request.url));
        }
    } else { // Fallback for safety
        if (isDashboardPath) {
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            return res;
        }
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};