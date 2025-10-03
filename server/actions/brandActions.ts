"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { brandSchema } from "@/lib/validations";
import { Brand, Competitor } from "@/types";
import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";

export async function addBrand(values: z.infer<typeof brandSchema>) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  const { competitors, ...brandData } = values;

  try {
    const brandResult = await brandRequest("/brands/", "POST", {
      body: JSON.stringify({
        client_id: user.client_id,
        ...brandData,
      }),
    });

    if (competitors && competitors.length > 0) {
      await addCompetitors(brandResult.brand_id, competitors);
    }

    revalidatePath("/brands");
    return { success: true, data: brandResult };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function addCompetitors(brandId: string, competitors: any[]) {
  const user = await getCurrentUser();
  if (!user) {
    console.error("Unauthorized attempt to add competitors.");
    return;
  }
  try {
    await brandRequest("/brands/competitors/", "POST", {
      body: JSON.stringify({
        brand_id: brandId,
        client_id: user.client_id,
        competitors,
      }),
    });
  } catch (error) {
    console.error("Failed to add competitors:", error);
  }
}

export async function getBrands(): Promise<Brand[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const brands = await brandRequest(
      `/brands/?client_id=${user.client_id}`,
      "GET"
    );
    return brands;
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
}

export async function getCompetitors(
  brand_id: string
): Promise<{ brand_id: string; competitors: Competitor[] }> {
  const user = await getCurrentUser();
  const emptyResult = { brand_id, competitors: [] };

  if (!user) return emptyResult;

  try {
    const result = await brandRequest(
      `/brands/competitors/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );
    return result;
  } catch (error) {
    console.error(`Failed to fetch competitors for brand ${brand_id}:`, error);
    return emptyResult;
  }
}

export async function getBrandById(
  brand_id: string
): Promise<Brand | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const brands = await brandRequest(
      `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`, "GET"
    );
    return brands[0] || null;
  } catch (error) {
    console.error(`Failed to fetch brand ${brand_id}:`, error);
    return null;
  }
}

export async function deleteBrand(brand_id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await brandRequest(
      `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "DELETE"
    );

    revalidatePath("/brands");
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete brand ${brand_id}:`, error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}