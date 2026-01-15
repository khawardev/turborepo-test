'use server'

import { cookies } from "next/headers";
const API_URL = process.env.API_URL;

export async function brandRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
    cache: RequestCache = "no-store"
) {
    const accessToken = (await cookies()).get("access_token")?.value;
    
    if (!accessToken) {
        return { success: false, error: "Unauthorized - No access token" };
    }

    const headers: HeadersInit = { Authorization: `Bearer ${accessToken}` };
    const isFormData = body instanceof FormData;

    if (!isFormData) headers["Content-Type"] = "application/json";

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method, headers, body: isFormData ? body : body ? JSON.stringify(body) : undefined, cache,
        });

        let data;
        try { data = await res.json(); } catch { data = null }

        if (res.ok) {
            return { success: true, data };
        }

        if (res.status === 401) {
            return { success: false, error: "Unauthorized - Token expired", authError: true };
        }

        return { success: false, error: data?.message || data?.detail || "Request failed" };
    } catch (e) {
        console.error("[brandRequest] Fetch error:", e);
        return { success: false, error: "Network error" };
    }
}
