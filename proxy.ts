import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRequest } from "@/server/api/authRequest";

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

    let response = NextResponse.next();
    let user = null;

    const userRes = await authRequest("/users/me/", "GET", { headers: { Authorization: `Bearer ${accessToken}` } });

    if (userRes.success) {
        user = userRes.data;
    } else {
        try {
            const refreshRes = await authRequest("/refresh-token", "POST", { body: JSON.stringify({ refresh_token: refreshToken }) });

            if (!refreshRes.success) {
                const res = NextResponse.redirect(new URL("/login", request.url));
                res.cookies.delete("access_token");
                res.cookies.delete("refresh_token");
                return res;
            }

            response.cookies.set("access_token", refreshRes.data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
            response.cookies.set("refresh_token", refreshRes.data.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });

            const newUser = await authRequest("/users/me/", "GET", { headers: { Authorization: `Bearer ${refreshRes.data.access_token}` } });
            if (newUser.success) user = newUser.data;
        } catch {
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            return res;
        }
    }

    if (user) {
        if (authPaths.some(p => pathname.startsWith(p)) || !isDashboardPath)
            return NextResponse.redirect(new URL("/dashboard/brandos-v2.1/setup", request.url));
    } else {
        if (isDashboardPath) {
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            return res;
        }
    }

    return response;
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };