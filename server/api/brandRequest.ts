'use server'

import { cookies } from "next/headers";
const API_URL = process.env.API_URL;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 100;

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method, 
                headers, 
                body: isFormData ? body : body ? JSON.stringify(body) : undefined, 
                cache,
            });

            let data;
            try { 
                data = await res.json(); 
            } catch { 
                data = null;
            }

            if (res.ok) {
                return { success: true, data };
            }

            if (res.status === 401) {
                return { success: false, error: "Unauthorized - Token expired", authError: true };
            }

            if (res.status >= 500 && attempt < MAX_RETRIES) {
                lastError = data?.message || data?.detail || "Server error";
                await delay(RETRY_DELAY_MS * (attempt + 1));
                continue;
            }

            return { success: false, error: data?.message || data?.detail || "Request failed" };
        } catch (e: any) {
            lastError = e?.message || "Network error";
            
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY_MS * (attempt + 1));
                continue;
            }
            
            console.error("[brandRequest] Fetch error:", e);
            return { success: false, error: "Network error" };
        }
    }

    return { success: false, error: lastError || "Request failed after retries" };
}
