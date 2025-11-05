'use server'
const API_URL = process.env.API_URL;

export async function authRequest(
    endpoint: string,
    method: "GET" | "POST",
    options: RequestInit = {}
) {
    
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json", ...options.headers },
        body: options.body,
        cache: "no-store",
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = data?.detail || data?.message || "API request failed";
        throw new Error(typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg));
    }

    return data;
}