"use server";

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

  let data;
  try { data = await res.json(); } catch { data = null }

  if (res.ok) {
    return { success: true, data };
  }

  return { success: false, error: data?.message || data?.detail || "Request failed" };
}