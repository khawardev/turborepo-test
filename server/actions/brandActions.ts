"use server";

import { brandSchema } from "@/lib/static/validations";
import { brandRequest } from "@/server/api/brandRequest";
import { Brand, Competitor } from "@/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/server/actions/authActions";

export async function addBrand(values: z.infer<typeof brandSchema>) {
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

    revalidatePath("/ccba");
    return { success: true, data: brandResult };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function addCompetitors(brandId: string, competitors: any[]) {
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

export async function updateBrand(brandId: string, values: any) {
  const user = await getCurrentUser();

  const { ...brandData } = values;

  try {
    const brandResult = await brandRequest(
      `/brands?client_id=${user.client_id}&brand_id=${brandId}`,
      "PUT",
      { body: JSON.stringify(brandData) }
    );

    revalidatePath("/ccba");
    revalidatePath(`/ccba/${brandId}`);

    return { success: true, data: brandResult };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Something went wrong during the update process.",
    };
  }
}

export async function updateCompetitorAction(brandId: string, competitor: any) {
  const user = await getCurrentUser();

  if (!competitor.competitor_id) {
    return { success: false, error: "Competitor ID is missing" };
  }

  const { competitor_id, ...competitorData } = competitor;
  try {
    await brandRequest(
      `/brands/competitors?client_id=${user.client_id}&brand_id=${brandId}&competitor_id=${competitor_id}`,
      "PUT",
      { body: JSON.stringify(competitorData) }
    );
    revalidatePath("/brands");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Something went wrong during competitor update.",
    };
  }
}

export async function getBrands(): Promise<Brand[]> {
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

export async function getBrandById(brand_id: string): Promise<Brand | null> {
  const user = await getCurrentUser();

  try {
    const brands = await brandRequest(
      `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );
    return brands[0] || null;
  } catch (error) {
    console.error(`Failed to fetch brand ${brand_id}:`, error);
    return null;
  }
}

export async function getBrandbyIdWithCompetitors(brand_id: string) {
  const user = await getCurrentUser();

  try {
    const [brandResponse, competitorResponse] = await Promise.all([
      brandRequest(
        `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
        "GET"
      ),
      brandRequest(
        `/brands/competitors/?client_id=${user.client_id}&brand_id=${brand_id}`,
        "GET"
      ),
    ]);

    const brand = brandResponse?.[0] || null;
    const competitors = competitorResponse?.competitors || [];

    if (!brand) return null;

    return {
      ...brand,
      competitors,
    };
  } catch (error) {
    console.error(
      `Failed to fetch brand or competitors for ${brand_id}:`,
      error
    );
    return null;
  }
}

export async function getCompetitors(
  brand_id: string
): Promise<{ brand_id: string; competitors: Competitor[] }> {
  const emptyResult = { brand_id, competitors: [] };
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

export async function deleteBrand(brand_id: string) {
  const user = await getCurrentUser();

  try {
    const brandDelete = await brandRequest(
      `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "DELETE"
    );

    revalidatePath("/ccba");
    return {
      success: true,
      message: "Brand deleted successfully ",
      data: brandDelete,
    };
  } catch (error: any) {
    console.error(`Failed to delete brand ${brand_id}:`, error);
    return {
      success: false,
      message: "Failed to delete brand. Please try again.",
      console: error?.message,
      data: null,
    };
  }
}

export async function getClientDetails() {
  const user = await getCurrentUser();

  try {
    const result = await brandRequest(
      `/clients/${user.client_id}/details`,
      "GET"
    );
    return { success: true, data: result };
  } catch (error: any) {
    console.error(
      `Failed to get client details for client ${user.client_id}:`,
      error
    );
    return {
      success: false,
      error: error.message || "Failed to fetch client details",
    };
  }
}
