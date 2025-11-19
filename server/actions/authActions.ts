"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/static/validations";
import { authRequest } from "@/server/api/authRequest";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import { z } from "zod";
const API_URL = process.env.API_URL;

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const data = await authRequest("/login", "POST", {
      body: JSON.stringify(values),
    });

    const cookieStore = await cookies();

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.detail || "Login failed" };
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  try {
    const data = await authRequest("/register", "POST", {
      body: JSON.stringify(values),
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.detail || "Registration failed" };
  }
}

export async function forgotPassword(
  values: z.infer<typeof forgotPasswordSchema>
) {
  try {
    const data = await authRequest("/forgot-password", "POST", {
      body: JSON.stringify(values),
    });
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.detail ||
        "If an account with that email exists, a password reset link has been sent.",
    };
  }
}

export async function resetPassword(token: string, new_password: string) {
  try {
    const data = await authRequest("/reset-password", "POST", {
      body: JSON.stringify({ token, new_password }),
    });
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.detail || "Invalid or expired token",
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await authRequest("/logout", "POST", {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        console.warn("Already logged out or not authenticated.");
      } else {
        console.error("API logout failed:", error);
      }
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  revalidatePath("/");
  return { success: true };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken || !refreshToken) return null;
  
  try {
    const user = await authRequest("/users/me/", "GET", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user in getCurrentUser:", error);
    return null;
  }
}

