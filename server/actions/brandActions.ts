"use server";

import { brandSchema } from "@/lib/validations";
import { brandRequest } from "@/server/api/brandRequest";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/actions/authActions";
import { getWebsiteBatchIdWithUser } from "@/server/actions/ccba/website/websiteScrapeActions";
import { getSocialBatchIdWithUser } from "@/server/actions/ccba/social/socialScrapeActions";
import { getBatchWebsiteScrapeStatusWithUser } from "@/server/actions/ccba/website/websiteStatusAction";
import { getBatchSocialScrapeStatusWithUser } from "@/server/actions/ccba/social/socialStatusAction";


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
        data.sort((a: any, b: any) => {
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

export async function getBrandsWithUser(user: any) {
  try {
    if (!user || !user.client_id) return [];

    const { success, data, error } = await brandRequest(
      `/brands/?client_id=${user.client_id}`,
      "GET"
    );

    if (!success) return null;

    if (Array.isArray(data)) {
        data.sort((a: any, b: any) => {
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

export async function getEnrichedBrands() {
  const user = await getCurrentUser();
  if (!user || !user.client_id) {
    console.error("[getEnrichedBrands] User not authenticated");
    return [];
  }

  const brands = await getBrandsWithUser(user);
  if (!brands || brands.length === 0) return [];

  const enrichedBrands: any[] = [];
  
  for (const brand of brands) {
    const enrichedBrand = await enrichBrandWithUser(brand, user);
    enrichedBrands.push(enrichedBrand);
  }

  return enrichedBrands;
}

async function enrichBrandWithUser(brand: any, user: any) {
  let websiteBatchId = null;
  let socialBatchId = null;
  let competitors: any[] = [];
  let webStatus = null;
  let socialStatus = null;

  try {
    const webBatchResult = await getWebsiteBatchIdWithUser(brand.brand_id, user);
    websiteBatchId = webBatchResult || null;

    const socialBatchResult = await getSocialBatchIdWithUser(brand.brand_id, user);
    socialBatchId = socialBatchResult || null;

    const competitorsResult = await getCompetitorsWithUser(brand.brand_id, user);
    if (competitorsResult?.competitors) {
      competitors = competitorsResult.competitors;
    }

    if (websiteBatchId) {
      const webStatusResult = await getBatchWebsiteScrapeStatusWithUser(brand.brand_id, websiteBatchId, user);
      webStatus = webStatusResult?.status || null;
    }

    if (socialBatchId) {
      const socialStatusResult = await getBatchSocialScrapeStatusWithUser(brand.brand_id, socialBatchId, user);
      socialStatus = socialStatusResult?.status || null;
    }
  } catch (e) {
    console.error(`[enrichBrandWithUser] Error enriching brand ${brand.brand_id}:`, e);
  }

  return {
    ...brand,
    websiteBatchId,
    socialBatchId,
    competitors,
    webStatus,
    socialStatus
  };
}

