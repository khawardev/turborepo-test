"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { loginSchema, registerSchema } from "@/lib/validations";
import { authRequest } from "@/server/api/authRequest";

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

    revalidatePath("/brands");
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

export async function getCurrentUser(): Promise<any | null> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }
  const user = await authRequest("/users/me/", "GET", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return user;
}
