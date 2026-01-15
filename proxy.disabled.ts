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

    if (!accessToken && !refreshToken) {
        if (isDashboardPath) return NextResponse.redirect(new URL("/", request.url));
        return NextResponse.next();
    }

    let user = null;
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;

    if (accessToken) {
        const userRes = await authRequest("/users/me/", "GET", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (userRes.success) {
            user = userRes.data;
        }
    }

    if (!user && refreshToken) {
        try {
            const refreshRes = await authRequest("/refresh-token", "POST", {
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!refreshRes.success) {
                console.error("[Middleware] Token refresh failed:", refreshRes.error);
                const res = NextResponse.redirect(new URL("/login", request.url));
                res.cookies.delete("access_token");
                res.cookies.delete("refresh_token");
                return res;
            }

            newAccessToken = refreshRes.data.access_token;
            newRefreshToken = refreshRes.data.refresh_token;

            const newUserRes = await authRequest("/users/me/", "GET", {
                headers: { Authorization: `Bearer ${newAccessToken}` },
            });

            if (newUserRes.success) {
                user = newUserRes.data;
            }
        } catch (error) {
            console.error("[Middleware] Token refresh error:", error);
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            return res;
        }
    }

    if (user) {
        if (authPaths.some((p) => pathname.startsWith(p)) || !isDashboardPath) {
            const redirectRes = NextResponse.redirect(
                new URL("/dashboard/brandos-v2.1/setup", request.url)
            );
            if (newAccessToken && newRefreshToken) {
                setCookiesOnResponse(redirectRes, newAccessToken, newRefreshToken);
            }
            return redirectRes;
        }

        const response = NextResponse.next();
        if (newAccessToken && newRefreshToken) {
            setCookiesOnResponse(response, newAccessToken, newRefreshToken);
        }
        return response;
    }

    if (isDashboardPath) {
        const res = NextResponse.redirect(new URL("/login", request.url));
        res.cookies.delete("access_token");
        res.cookies.delete("refresh_token");
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};