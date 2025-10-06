"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { brandSchema } from "@/lib/validations";
import { Brand, Competitor } from "@/types";
import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";

export async function addBrand(values: z.infer<typeof brandSchema>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await getCurrentUser();
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to add competitors.");
    return;
  }
  const user = await getCurrentUser();

  
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

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken)  return [];
  const user = await getCurrentUser();
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
  const emptyResult = { brand_id, competitors: [] };
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken)  return emptyResult;
  const user = await getCurrentUser();

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

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return null;
  const user = await getCurrentUser();
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

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();
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