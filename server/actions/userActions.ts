"use server";

import { authApi } from "@/lib/hooks/getAuthApi";
import { User } from "@/types";
import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<User | null> {
  const cookie = await cookies();
  const accessToken = cookie.get("access_token")?.value;
  const refreshToken = cookie.get("refresh_token")?.value;

  if (!accessToken) return null;

  try {
    const user = await authApi.fetchMe(accessToken);
    return user;
  } catch (error: any) {
    if (error.status === 401 && refreshToken) {
      try {
        const newTokens = await authApi.refreshToken(refreshToken);
        cookie.set("access_token", newTokens.access_token, {
          httpOnly: true,
          secure: true,
        });
        cookie.set("refresh_token", newTokens.refresh_token, {
          httpOnly: true,
          secure: true,
        });

        const user = await authApi.fetchMe(newTokens.access_token);
        return user;
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
        return null;
      }
    }

    console.error("Auth error:", error);
    return null;
  }
}