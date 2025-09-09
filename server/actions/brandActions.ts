"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { brandSchema } from "@/lib/validations";
import { getCurrentUser } from "./authActions";
import { Brand, Competitor } from "@/types";

const API_URL = "http://54.221.221.0:8000";

export async function addBrand(values: z.infer<typeof brandSchema>) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return { success: false, error: "Unauthorized" };
  }

  const { competitors, ...brandData } = values;

  try {
    // Create the brand
    const brandRes = await fetch(`${API_URL}/brands/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...brandData,
        client_id: user.client_id,
      }),
    });

    const brandResult = await brandRes.json();

    if (!brandRes.ok) {
      return {
        success: false,
        error: brandResult.detail || "Failed to create brand",
      };
    }

    // If there are competitors, add them
    if (competitors && competitors.length > 0) {
      const competitorsRes = await fetch(`${API_URL}/brands/competitors/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand_id: brandResult.brand_id,
          client_id: user.client_id,
          competitors: competitors,
        }),
      });

      if (!competitorsRes.ok) {
        const competitorsResult = await competitorsRes.json();
        // Optionally, you might want to delete the created brand here if competitors fail
        return {
          success: false,
          error:
            competitorsResult.detail || "Brand created, but failed to add competitors",
        };
      }
    }

    revalidatePath("/me/brands");
    return { success: true, data: brandResult };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
}

export async function getBrands(): Promise<Brand[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return [];
  }

  try {
    const res = await fetch(`${API_URL}/brands/?client_id=${user.client_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch (error) {
    return [];
  }
}

export async function getCompetitors(brand_id: string): Promise<Competitor[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
        return [];
    }

    try {
        const res = await fetch(`${API_URL}/brands/competitors/?client_id=${user.client_id}&brand_id=${brand_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        return [];
    }
}
