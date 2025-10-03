'use server'
const API_URL = process.env.API_URL;

export async function authRequest(endpoint: string, method: "GET" | "POST", options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        body: options.body,
        cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
        throw { status: res.status, detail: data.detail || "API request failed" };
    }
    return data;
}