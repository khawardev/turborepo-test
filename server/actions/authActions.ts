"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { loginSchema, registerSchema } from "@/lib/validations";
import { User } from "@/types";

const API_URL = "http://54.221.221.0:8000";

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.detail || "Login failed" };
    }

    const cookieStore = await cookies();
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong" };
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.detail || "Registration failed" };
    }

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error("Logout failed on server", error);
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  revalidatePath("/");
  return { success: true };
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}