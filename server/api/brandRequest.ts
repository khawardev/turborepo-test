'use server'

import { cookies } from "next/headers";
const API_URL = process.env.API_URL;

export async function brandRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
    cache: RequestCache = "no-store"
) {
    const token = (await cookies()).get("access_token")?.value;
    if (!token) throw new Error("Unauthorized");

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body.body ?? body) : undefined,
        cache,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = data?.detail || data?.message || data || "Request failed";
        throw new Error(typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg));
    }

    return data;
}