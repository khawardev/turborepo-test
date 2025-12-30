"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validations";
import { authRequest } from "@/server/api/authRequest";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { redirect } from "next/navigation";

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const { success, data, error } = await authRequest("/login", "POST", {
      body: JSON.stringify(values),
    });
    if (!success) return { success: false, message: error };

    const cookieStore = await cookies();

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

    revalidatePath("/");
    return { success: true, message: "Login successful", data };
  } catch {
    return { success: false, message: "Login failed" };
  }
}


export async function register(values: any) {
  try {
    const { success, data, error } = await authRequest("/register", "POST", {
      body: JSON.stringify(values),
    });

    if (!success) return { success: false, message: error };

    return { success: true, message: "Registration successful", data };
  } catch {
    return { success: false, message: "Registration failed" };
  }
}

export async function forgotPassword(values: any) {
  try {
    const { success, data, error } = await authRequest(
      "/forgot-password",
      "POST",
      {
        body: JSON.stringify(values),
      }
    );

    if (!success) {
      return {
        success: false,
        message:
          error ||
          "If an account with that email exists, a password reset link has been sent.",
      };
    }

    return {
      success: true,
      message: "Password reset link sent",
      data,
    };
  } catch {
    return { success: false, message: "Failed to send reset link" };
  }
}

export async function resetPassword(token: string, new_password: string) {
  try {
    const { success, data, error } = await authRequest(
      "/reset-password",
      "POST",
      {
        body: JSON.stringify({ token, new_password }),
      }
    );

    if (!success) return { success: false, message: error };

    return { success: true, message: "Password reset successfully", data };
  } catch {
    return { success: false, message: "Password reset failed" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      const { success, error } = await authRequest("/logout", "POST", {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!success) {
        console.warn("Logout API warning:", error);
      }
    } catch (error) {
      console.error("Logout unexpected error:", error);
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  revalidatePath("/");
  return { success: true, message: "Logged out successfully" };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken || !refreshToken) return null;

  try {
    const { success, data, error } = await authRequest("/users/me/", "GET", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!success) return null;

    return data;
  } catch (error) {
    return null;
  }
}

export async function googleLogin() {
  redirect(`${process.env.API_URL}/login/google`);
}

export async function storeTokens(access: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", access, { httpOnly: true, secure: true, path: "/" });
  cookieStore.set("refresh_token", refresh, { httpOnly: true, secure: true, path: "/" });
}