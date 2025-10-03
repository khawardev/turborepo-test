'use server'

import { cookies } from "next/headers";
const API_URL = process.env.API_URL;


export async function brandRequest(endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: any) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
        throw new Error("Unauthorized");
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.detail || "API request failed");
    }
    return data;
}