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

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: prepareRequestBody(body),
        cache: 'force-cache',
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const message = data?.detail || data?.message || "Request failed";
        throw new Error(message);
    }

    return data;
}

function prepareRequestBody(body?: any) {
    if (!body) return undefined;
    if (typeof body === "string") return body;
    if (typeof body === "object" && body.body)
        return typeof body.body === "string" ? body.body : JSON.stringify(body.body);
    return JSON.stringify(body);
}