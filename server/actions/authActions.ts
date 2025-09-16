"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { loginSchema, registerSchema } from "@/lib/validations";
import { authApi } from "@/lib/hooks/getAuthApi";

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const data = await authApi.login(values);

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

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.detail || "Login failed" };
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  try {
    const data = await authApi.register(values);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.detail || "Registration failed" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch (error) {
      console.error("API logout failed, clearing cookies regardless.", error);
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  revalidatePath("/", "layout");
  return { success: true };
}

async function handleTokenRefresh(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken =  cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const data = await authApi.refreshToken(refreshToken);
    const { access_token, refresh_token: new_refresh_token } = data;

    if (!access_token) return null;

    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    if (new_refresh_token) {
      cookieStore.set("refresh_token", new_refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return null;
  }
}

export async function getCurrentUser(): Promise<any | null> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const user = await authApi.fetchMe(accessToken);
    return user;
  } catch (error: any) {
    if (error.status === 401) {
      const newAccessToken = await handleTokenRefresh();
      if (newAccessToken) {
        try {
          const user = await authApi.fetchMe(newAccessToken);
          return user;
        } catch (retryError) {
          return null;
        }
      }
    }
    return null;
  }
}

export async function getAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", user: null, token: null };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return { success: false, error: "Unauthorized", user: null, token: null };
  }

  return { success: true, user, token };
}