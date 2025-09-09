"use server";

import { User } from "@/types";
import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<User | null> {
  const cookie = await cookies();
  const accessToken = cookie.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store", 
    });

    if (res.ok) {
      const user = await res.json();
      return user;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
