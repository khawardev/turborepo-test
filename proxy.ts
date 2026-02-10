import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRequest } from "@/server/api/authRequest";

function setCookiesOnResponse(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
) {
    response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
    const isDashboardPath = pathname.startsWith("/dashboard");

    let accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // 1. If no tokens at all, redirect to login (if on dashboard)
    if (!accessToken && !refreshToken) {
        if (isDashboardPath) return NextResponse.redirect(new URL("/login", request.url));
        return NextResponse.next();
    }

    let user = null;
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;
    let authFailedExplicitly = false; // New flag to track REAL auth failures

    // 2. Validate Access Token
    if (accessToken) {
        try {
            const userRes = await authRequest("/users/me/", "GET", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (userRes.success) {
                user = userRes.data;
            } else {
                // Only treat 401/403 as explicit failure requiring refresh
                // 500s or network errors are just logged
                if (userRes.status === 401 || userRes.status === 403) {
                     console.warn(`[Middleware] Token invalid (${userRes.status}) for ${pathname}`);
                     if (!refreshToken) {
                         authFailedExplicitly = true;
                     }
                } else {
                     console.error(`[Middleware] Backend error (${userRes.status}) for ${pathname}:`, userRes.error);
                }
            }
        } catch (err) {
            console.error("[Middleware] Backend connection error during token validation:", err);
            // DO NOT logout here. The backend might just be down/busy.
        }
    }

    // 3. Attempt Refresh if user is still null (and we have a refresh token)
    if (!user && refreshToken) {
        try {
            const refreshRes = await authRequest("/refresh-token", "POST", {
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!refreshRes.success) {
                console.error("[Middleware] Token refresh failed:", refreshRes.error);
                // Only mark as explicit failure if refresh endpoint specifically returns 400/401/403
                if (refreshRes.status === 400 || refreshRes.status === 401 || refreshRes.status === 403) {
                    authFailedExplicitly = true;
                }
            } else {
                newAccessToken = refreshRes.data.access_token;
                newRefreshToken = refreshRes.data.refresh_token;

                // Retry user fetch with new token
                // We'll trust the refresh succeeded. Even if this next call fails, we have valid tokens.
                const newUserRes = await authRequest("/users/me/", "GET", {
                    headers: { Authorization: `Bearer ${newAccessToken}` },
                });

                if (newUserRes.success) {
                    user = newUserRes.data;
                } else {
                    if (newUserRes.status === 401 || newUserRes.status === 403) {
                        authFailedExplicitly = true; 
                    } else {
                        console.warn("[Middleware] User fetch failed after refresh, but tokens are valid. Proceeding.");
                    }
                }
            }
        } catch (error) {
            console.error("[Middleware] Token refresh error:", error);
            // Network error during refresh. Do not logout.
        }
    }

    // 4. Handle Redirection Logic for LOGGED IN users
    if (user) {
        // Logged in user trying to access public auth pages -> Go to Dashboard
        if (authPaths.some((p) => pathname.startsWith(p))) {
            const redirectRes = NextResponse.redirect(
                new URL("/dashboard/brandos-v2.1/setup", request.url)
            );
            if (newAccessToken && newRefreshToken) {
                setCookiesOnResponse(redirectRes, newAccessToken, newRefreshToken);
            }
            return redirectRes;
        }

        // Pass through valid request
        const response = NextResponse.next();
        if (newAccessToken && newRefreshToken) {
            setCookiesOnResponse(response, newAccessToken, newRefreshToken);
        }
        return response;
    }

    // 5. The Safety Net logic (User is NULL)
    if (authFailedExplicitly) {
        const response = isDashboardPath 
            ? NextResponse.redirect(new URL("/login", request.url))
            : NextResponse.next();
        
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");
        return response;
    }

    if (isDashboardPath) {
        // If auth didn't "fail" but user is null (e.g. Backend Timeout/500 Error),

        // If auth didn't "fail" but user is null (e.g. Backend Timeout/500 Error),
        // we allow request to proceed but MUST try to help downstream by passing tokens.
        
        console.warn("[Middleware] Auth check failed (possibly backend timeout). Allowing request to proceed.");
        
        const requestHeaders = new Headers(request.headers);
        if (newAccessToken) {
            requestHeaders.set("Authorization", `Bearer ${newAccessToken}`);
            // Update cookie header so Server Actions/API routes using cookies() see the new token
            // Note: This is a simple append, actual parsing might vary but usually works for standard parsers
            requestHeaders.set("Cookie", `access_token=${newAccessToken}; refresh_token=${newRefreshToken}`);
        }

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        // Always set the new cookies on the response for the browser
        if (newAccessToken && newRefreshToken) {
            setCookiesOnResponse(response, newAccessToken, newRefreshToken);
        }
        
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};