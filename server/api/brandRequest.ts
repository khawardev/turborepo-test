'use server'

import { cookies } from "next/headers";
const API_URL = process.env.API_URL;

export async function brandRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) throw new Error("Unauthorized");

    let normalizedBody;
    if (body) {
        if (typeof body === "string") normalizedBody = body;
        else if (typeof body === "object" && body.body) {normalizedBody =typeof body.body === "string" ? body.body : JSON.stringify(body.body);
        } else {
            normalizedBody = JSON.stringify(body);
        }
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(normalizedBody ? { body: normalizedBody } : {}),
        cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
        const message =
            typeof data === "string"
                ? data
                : data.detail || data.message || JSON.stringify(data);
        throw new Error(message);
    }

    return data;
}