"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { brandSchema } from "@/lib/validations";
import { Brand, Competitor } from "@/types";
import { scrapeWebsite } from "./scrapeActions";
import { api } from "@/lib/hooks/getBrandsApi";
import { getAuth } from "./authActions";

export async function addBrand(values: z.infer<typeof brandSchema>) {
  const auth = await getAuth();
  if (!auth.success || !auth.user) {
    return { success: false, error: "Unauthorized" };
  }
  const { user } = auth;
  const { competitors, ...brandData } = values;

  try {
    const brandResult = await api.createBrand({
      client_id: user.client_id,
      ...brandData,
    });

    scrapeWebsite({
      url: brandResult.url,
      brand_id: brandResult.brand_id,
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
  const auth = await getAuth();
  if (!auth.success || !auth.user) {
    console.error("Unauthorized attempt to add competitors.");
    return;
  }
  const { user } = auth;
  try {
    const competitorsResult = await api.createCompetitors({
      brand_id: brandId,
      client_id: user.client_id,
      competitors,
    });

    competitorsResult.forEach((competitor: Competitor) => {
      scrapeWebsite({
        url: competitor.url,
        brand_id: brandId,
        competitor_id: competitor.competitor_id,
      });
    });
  } catch (error) {
    console.error("Failed to add competitors:", error);
  }
}

export async function getBrands(): Promise<Brand[]> {
  const auth = await getAuth();
  if (!auth.success || !auth.user) {
    return [];
  }

  try {
    const brands = await api.getBrands(auth.user.client_id);
    return brands;
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
}

export async function getCompetitors(brand_id: string): Promise<{ brand_id: string; competitors: Competitor[] }> {
  const auth = await getAuth();
  const emptyResult = { brand_id: brand_id, competitors: [] };

  if (!auth.success || !auth.user) {
    return emptyResult;
  }

  try {
    const result = await api.getCompetitors(auth.user.client_id, brand_id);
    return result;
  } catch (error) {
    console.error(`Failed to fetch competitors for brand ${brand_id}:`, error);
    return emptyResult;
  }
}

export async function getBrandById(brand_id: string): Promise<Brand | null> {
  const auth = await getAuth();
  if (!auth.success || !auth.user) {
    return null;
  }

  try {
    const brands = await api.getBrands(auth.user.client_id, brand_id);
    return brands[0] || null;
  } catch (error) {
    console.error(`Failed to fetch brand ${brand_id}:`, error);
    return null;
  }
}