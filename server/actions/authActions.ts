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
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await authRequest("/logout", "POST", {
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error("API logout failed, clearing cookies regardless.", error);
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  revalidatePath("/");
  return { success: true };
}

export async function refreshTokens(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return { success: false };
  }

  try {
    const data = await authRequest("/refresh-token", "POST", {
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    cookieStore.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return { success: true };
  } catch (error) {
    // If refresh fails, simply return false. The user will be treated as logged out.
    return { success: false };
  }
}

export const getCurrentUser = cache(async (): Promise<any | null> => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    // First, try to get the user with the current access token
    const user = await authRequest("/users/me/", "GET", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return user;
  } catch (error: any) {
    // If it fails because the token is expired, try to refresh it
    if (error.status === 401) {
      const refreshResult = await refreshTokens();
      if (refreshResult.success) {
        // If refresh was successful, get the new token and retry fetching the user
        const newAccessToken = cookieStore.get("access_token")?.value;
        if (newAccessToken) {
          try {
            const user = await authRequest("/users/me/", "GET", {
              headers: { Authorization: `Bearer ${newAccessToken}` },
            });
            return user;
          } catch (retryError) {
            // If the retry fails, the user is not authenticated
            return null;
          }
        }
      }
    }
    // For any other error, or if refresh fails, the user is not authenticated
    return null;
  }
});
