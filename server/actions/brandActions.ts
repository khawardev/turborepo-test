"use server";

import { brandSchema } from "@/lib/validations";
import { brandRequest } from "@/server/api/brandRequest";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/actions/authActions";
import { getPreviousSocialScrapes } from "@/server/actions/ccba/social/socialScrapeActions";
import { getpreviousWebsiteScraps } from "@/server/actions/ccba/website/websiteScrapeActions";
import { cache } from "react";


export async function addBrand(values: z.infer<typeof brandSchema>) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { competitors, ...brandData } = values;

    const { success, data, error } = await brandRequest("/brands/", "POST", {
      client_id: user.client_id,
      ...brandData,
    });

    if (!success) return { success: false, message: error };

    if (competitors && competitors.length > 0) {
      const competitorsResult = await addCompetitors(data.brand_id, competitors);
      if (!competitorsResult.success) {
        return competitorsResult;
      }
    }

    revalidatePath("/dashboard/ccba");
    return {
      success: true,
      message: "Brand added successfully",
      data,
    };
  } catch (e) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function addCompetitors(brandId: string, competitors: any[]) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { success, data, error } = await brandRequest(
      "/brands/competitors/",
      "POST",
      {
        brand_id: brandId,
        client_id: user.client_id,
        competitors,
      }
    );

    if (!success) return { success: false, message: error };

    return { success: true, message: "Competitors added successfully", data };
  } catch (e) {
    return {
      success: false,
      message: "Failed to add competitors",
    };
  }
}

export async function updateBrand(brandId: string, values: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { ...brandData } = values;

    const { success, data, error } = await brandRequest(
      `/brands?client_id=${user.client_id}&brand_id=${brandId}`,
      "PUT",
      brandData
    );

    if (!success) return { success: false, message: error };

    revalidatePath("/dashboard/ccba");
    revalidatePath(`/dashboard/ccba/${brandId}`);

    return {
      success: true,
      message: "Brand updated successfully",
      data,
    };
  } catch (e) {
    return {
      success: false,
      message: "Something went wrong during the update process.",
    };
  }
}

export async function updateCompetitorAction(
  brandId: string,
  competitor: any
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!competitor.competitor_id) {
      return { success: false, message: "Competitor ID is missing" };
    }

    const { competitor_id, ...competitorData } = competitor;
    const { success, data, error } = await brandRequest(
      `/brands/competitors?client_id=${user.client_id}&brand_id=${brandId}&competitor_id=${competitor_id}`,
      "PUT",
      competitorData
    );

    if (!success) return { success: false, message: error };

    revalidatePath("/dashboard/ccba");
    return { success: true, message: "Competitor updated successfully", data };
  } catch (e) {
    return {
      success: false,
      message: "Something went wrong during competitor update.",
    };
  }
}

export async function getBrands() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { success, data, error } = await brandRequest(
      `/brands/?client_id=${user.client_id}`,
      "GET"
    );

    if (!success) return null;


    if (Array.isArray(data)) {
        return data.toSorted((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        });
    }

    return data;
  } catch (error) {
    return null;
  }
}



export async function getBrandById(brand_id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { success, data, error } = await brandRequest(
      `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );

    if (!success) return null;

    return data;
  } catch (error) {
    return null;
  }
}

export async function getBrandbyIdWithCompetitors(brand_id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const [brandRes, competitorRes] = await Promise.all([
      brandRequest(
        `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
        "GET"
      ),
      brandRequest(
        `/brands/competitors/?client_id=${user.client_id}&brand_id=${brand_id}`,
        "GET"
      ),
    ]);

    const { success: brandSuccess, data: brandData, error: brandError } = brandRes;
    const { success: compSuccess, data: compData, error: compError } = competitorRes;

    if (!brandSuccess) return null;
    
    let brand = null;
    if (Array.isArray(brandData)) {
        brand = brandData.length > 0 ? brandData[0] : null;
    } else {
        brand = brandData;
    }

    if (!brand) return null;

    let competitors: any[] = [];
    if (compSuccess) {
        competitors = Array.isArray(compData) ? compData : (compData?.competitors || []);
    }

    return {
      ...brand,
      competitors,
      client_id: user.client_id,
    };
  } catch {
    return null;
  }
}

export async function getCompetitors(brand_id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { success, data, error } = await brandRequest(
      `/brands/competitors/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );

    if (!success) return null;

    return data;
  } catch (error) {
    return null;
  }
}

export async function getCompetitorsWithUser(brand_id: string, user: any) {
  try {
    if (!user || !user.client_id) return null;

    const { success, data, error } = await brandRequest(
      `/brands/competitors/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );

    if (!success) return null;

    return data;
  } catch (error) {
    return null;
  }
}

export async function deleteBrand(brand_id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { success, data, error } = await brandRequest(
      `/brands/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "DELETE"
    );

    if (!success) return { success: false, message: error };

    revalidatePath("/dashboard/ccba");
    return {
      success: true,
      message: "Brand deleted successfully",
      data,
    };
  } catch (e) {
    return {
      success: false,
      message: "Failed to delete brand. Please try again.",
    };
  }
}

export async function getClientDetails() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { success, data, error } = await brandRequest(
      `/clients/${user.client_id}/details`,
      "GET"
    );

    if (!success) return null;

    return data;
  } catch (error) {
    return null;
  }
}

const BATCH_SIZE = 5;
const MAX_RETRIES = 2;

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (i === retries) {
        console.error(`[fetchWithRetry] All retries failed:`, error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }
  }
  return null;
}

function extractLatestBatchInfo(scrapes: any[] | null) {
  if (!scrapes || !Array.isArray(scrapes) || scrapes.length === 0) {
    return { batchId: null, status: null, error: null };
  }
  const latest = scrapes[0];
  return {
    batchId: latest.batch_id || null,
    status: latest.status || null,
    error: latest.error || latest.errors || null
  };
}

async function enrichBrand(brand: any, user: any): Promise<any> {
  const defaultResult = {
    ...brand,
    websiteBatchId: null,
    socialBatchId: null,
    competitors: [],
    webStatus: null,
    socialStatus: null,
    webError: null,
    socialError: null
  };

  if (!brand?.brand_id) {
    return defaultResult;
  }

  const [webScrapesResult, socialScrapesResult, competitorsResult] = await Promise.allSettled([
    fetchWithRetry(() => getpreviousWebsiteScraps(brand.brand_id)),
    fetchWithRetry(() => getPreviousSocialScrapes(brand.brand_id)),
    fetchWithRetry(() => getCompetitorsWithUser(brand.brand_id, user))
  ]);

  let websiteBatchId = null;
  let socialBatchId = null;
  let competitors: any[] = [];
  let webStatus = null;
  let socialStatus = null;
  let webError = null;
  let socialError = null;

  if (webScrapesResult.status === 'fulfilled' && webScrapesResult.value) {
    const webInfo = extractLatestBatchInfo(webScrapesResult.value);
    websiteBatchId = webInfo.batchId;
    webStatus = webInfo.status;
    webError = webInfo.error;
  } else if (webScrapesResult.status === 'rejected') {
    webError = 'Failed to fetch web batch data';
  }

  if (socialScrapesResult.status === 'fulfilled' && socialScrapesResult.value) {
    const socialInfo = extractLatestBatchInfo(socialScrapesResult.value);
    socialBatchId = socialInfo.batchId;
    socialStatus = socialInfo.status;
    socialError = socialInfo.error;
  } else if (socialScrapesResult.status === 'rejected') {
    socialError = 'Failed to fetch social batch data';
  }

  if (competitorsResult.status === 'fulfilled' && competitorsResult.value) {
    const compData = competitorsResult.value;
    competitors = Array.isArray(compData) ? compData : (compData?.competitors || []);
  }

  return {
    ...brand,
    websiteBatchId,
    socialBatchId,
    competitors,
    webStatus,
    socialStatus,
    webError,
    socialError
  };
}

async function processBrandsInBatches(brands: any[], user: any): Promise<any[]> {
  const results: any[] = [];

  for (let i = 0; i < brands.length; i += BATCH_SIZE) {
    const batch = brands.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((brand: any) => enrichBrand(brand, user))
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          ...batch[j],
          websiteBatchId: null,
          socialBatchId: null,
          competitors: [],
          webStatus: null,
          socialStatus: null,
          webError: 'Failed to fetch',
          socialError: 'Failed to fetch'
        });
      }
    }
  }

  return results;
}

async function getBrandsWithUser(user: any) {
  try {
    if (!user || !user.client_id) return [];

    const { success, data, error } = await brandRequest(
      `/brands/?client_id=${user.client_id}`,
      "GET"
    );

    if (!success) return [];

    if (Array.isArray(data)) {
      return data.toSorted((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

async function fetchEnrichedBrandsInternal() {
  const user = await getCurrentUser();
  if (!user?.client_id) {
    return [];
  }

  const brands = await getBrandsWithUser(user);
  if (!brands || brands.length === 0) return [];

  const enrichedBrands = await processBrandsInBatches(brands, user);

  return enrichedBrands;
}

export const getEnrichedBrands = cache(fetchEnrichedBrandsInternal);

export { getBrandsWithUser };
