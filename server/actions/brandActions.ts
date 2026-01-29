"use server";

import { brandSchema } from "@/lib/validations";
import { brandRequest, brandRequestWithToken, getAccessToken } from "@/server/api/brandRequest";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/actions/authActions";


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

async function fetchWebScrapesForBrand(
  brandId: string, 
  clientId: string, 
  accessToken: string
): Promise<any[] | null> {
  try {
    if (!clientId || !brandId || !accessToken) {
      console.log(`[fetchWebScrapesForBrand] Missing params: clientId=${!!clientId}, brandId=${!!brandId}, token=${!!accessToken}`);
      return null;
    }
    
    const { success, data } = await brandRequestWithToken(
      `/batch/website-scrapes?client_id=${clientId}&brand_id=${brandId}`,
      "GET",
      accessToken,
      undefined,
      'no-store'
    );

    console.log(`[fetchWebScrapesForBrand] brandId=${brandId}, success=${success}, dataLength=${Array.isArray(data) ? data.length : 'not array'}`);

    if (!success || !Array.isArray(data)) return null;
    if (data.length === 0) return [];

    return data
      .map((item: any) => ({
        brand_id: item.brand_id,
        client_id: item.client_id,
        created_at: item.created_at,
        status: item.status,
        scraped_pages: item.scraped_pages,
        batch_id: item.batch_id,
        errors: item.errors,
        result_keys: item.result_keys
      }))
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    console.error(`[fetchWebScrapesForBrand] Error for brandId=${brandId}:`, error);
    return null;
  }
}

async function fetchSocialScrapesForBrand(
  brandId: string, 
  clientId: string, 
  accessToken: string
): Promise<any[] | null> {
  try {
    if (!clientId || !brandId || !accessToken) {
      console.log(`[fetchSocialScrapesForBrand] Missing params: clientId=${!!clientId}, brandId=${!!brandId}, token=${!!accessToken}`);
      return null;
    }
    
    const { success, data } = await brandRequestWithToken(
      `/batch/social-scrapes?client_id=${clientId}&brand_id=${brandId}`,
      "GET",
      accessToken,
      undefined,
      'no-store'
    );

    console.log(`[fetchSocialScrapesForBrand] brandId=${brandId}, success=${success}, dataLength=${Array.isArray(data) ? data.length : 'not array'}`);

    if (!success || !Array.isArray(data)) return null;
    if (data.length === 0) return [];

    return data
      .map((item: any) => ({
        brand_id: item.brand_id,
        client_id: item.client_id,
        created_at: item.created_at,
        status: item.status,
        batch_id: item.batch_id,
        start_date: item.start_date,
        end_date: item.end_date,
        error: item.error
      }))
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    console.error(`[fetchSocialScrapesForBrand] Error for brandId=${brandId}:`, error);
    return null;
  }
}

async function fetchCompetitorsForBrand(
  brandId: string, 
  clientId: string, 
  accessToken: string
): Promise<any[] | null> {
  try {
    if (!clientId || !brandId || !accessToken) {
      console.log(`[fetchCompetitorsForBrand] Missing params: clientId=${!!clientId}, brandId=${!!brandId}, token=${!!accessToken}`);
      return null;
    }
    
    const { success, data } = await brandRequestWithToken(
      `/brands/competitors/?client_id=${clientId}&brand_id=${brandId}`,
      "GET",
      accessToken
    );

    console.log(`[fetchCompetitorsForBrand] brandId=${brandId}, success=${success}, dataType=${typeof data}, isArray=${Array.isArray(data)}, length=${Array.isArray(data) ? data.length : (data?.competitors?.length || 0)}`);

    if (!success) return null;
    
    return Array.isArray(data) ? data : (data?.competitors || []);
  } catch (error) {
    console.error(`[fetchCompetitorsForBrand] Error for brandId=${brandId}:`, error);
    return null;
  }
}

async function enrichBrandWithData(
  brand: any, 
  clientId: string, 
  accessToken: string
): Promise<any> {
  const brandId = brand?.brand_id;
  console.log(`[enrichBrandWithData] Starting enrichment for brandId=${brandId}, brandName=${brand?.name}`);

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

  if (!brandId) {
    console.log(`[enrichBrandWithData] No brand_id found, returning default`);
    return defaultResult;
  }

  const startTime = Date.now();
  const [webResult, socialResult, competitorsResult] = await Promise.allSettled([
    fetchWebScrapesForBrand(brandId, clientId, accessToken),
    fetchSocialScrapesForBrand(brandId, clientId, accessToken),
    fetchCompetitorsForBrand(brandId, clientId, accessToken)
  ]);
  const duration = Date.now() - startTime;

  console.log(`[enrichBrandWithData] brandId=${brandId} - Fetch completed in ${duration}ms`);
  console.log(`[enrichBrandWithData] brandId=${brandId} - webResult.status=${webResult.status}`);
  console.log(`[enrichBrandWithData] brandId=${brandId} - socialResult.status=${socialResult.status}`);
  console.log(`[enrichBrandWithData] brandId=${brandId} - competitorsResult.status=${competitorsResult.status}`);

  let websiteBatchId = null;
  let socialBatchId = null;
  let competitors: any[] = [];
  let webStatus = null;
  let socialStatus = null;
  let webError = null;
  let socialError = null;

  if (webResult.status === 'fulfilled' && webResult.value !== null) {
    const webInfo = extractLatestBatchInfo(webResult.value);
    websiteBatchId = webInfo.batchId;
    webStatus = webInfo.status;
    webError = webInfo.error;
    console.log(`[enrichBrandWithData] brandId=${brandId} - Web: batchId=${websiteBatchId}, status=${webStatus}`);
  } else if (webResult.status === 'rejected') {
    webError = 'Failed to fetch web data';
    console.log(`[enrichBrandWithData] brandId=${brandId} - Web fetch rejected:`, (webResult as PromiseRejectedResult).reason);
  } else {
    console.log(`[enrichBrandWithData] brandId=${brandId} - Web: No data (value is null)`);
  }

  if (socialResult.status === 'fulfilled' && socialResult.value !== null) {
    const socialInfo = extractLatestBatchInfo(socialResult.value);
    socialBatchId = socialInfo.batchId;
    socialStatus = socialInfo.status;
    socialError = socialInfo.error;
    console.log(`[enrichBrandWithData] brandId=${brandId} - Social: batchId=${socialBatchId}, status=${socialStatus}`);
  } else if (socialResult.status === 'rejected') {
    socialError = 'Failed to fetch social data';
    console.log(`[enrichBrandWithData] brandId=${brandId} - Social fetch rejected:`, (socialResult as PromiseRejectedResult).reason);
  } else {
    console.log(`[enrichBrandWithData] brandId=${brandId} - Social: No data (value is null)`);
  }

  if (competitorsResult.status === 'fulfilled' && competitorsResult.value !== null) {
    competitors = competitorsResult.value;
    console.log(`[enrichBrandWithData] brandId=${brandId} - Competitors: count=${competitors.length}`);
  } else if (competitorsResult.status === 'rejected') {
    console.log(`[enrichBrandWithData] brandId=${brandId} - Competitors fetch rejected:`, (competitorsResult as PromiseRejectedResult).reason);
  } else {
    console.log(`[enrichBrandWithData] brandId=${brandId} - Competitors: No data (value is null)`);
  }

  const enrichedBrand = {
    ...brand,
    websiteBatchId,
    socialBatchId,
    competitors,
    webStatus,
    socialStatus,
    webError,
    socialError
  };

  console.log(`[enrichBrandWithData] brandId=${brandId} - Final enriched brand:`, {
    name: enrichedBrand.name,
    websiteBatchId: enrichedBrand.websiteBatchId,
    socialBatchId: enrichedBrand.socialBatchId,
    competitorsCount: enrichedBrand.competitors?.length || 0,
    webStatus: enrichedBrand.webStatus,
    socialStatus: enrichedBrand.socialStatus
  });

  return enrichedBrand;
}

async function getBrandsWithToken(clientId: string, accessToken: string) {
  try {
    if (!clientId || !accessToken) {
      console.log(`[getBrandsWithToken] Missing params: clientId=${!!clientId}, token=${!!accessToken}`);
      return [];
    }

    console.log(`[getBrandsWithToken] Fetching brands for client_id=${clientId}`);

    const { success, data } = await brandRequestWithToken(
      `/brands/?client_id=${clientId}`,
      "GET",
      accessToken
    );

    console.log(`[getBrandsWithToken] success=${success}, dataLength=${Array.isArray(data) ? data.length : 'not array'}`);

    if (!success) return [];

    if (Array.isArray(data)) {
      return data.toSorted((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    return [];
  } catch (error) {
    console.error(`[getBrandsWithToken] Error:`, error);
    return [];
  }
}

async function getBrandsWithUser(user: any) {
  try {
    if (!user?.client_id) {
      console.log(`[getBrandsWithUser] No client_id found`);
      return [];
    }

    console.log(`[getBrandsWithUser] Fetching brands for client_id=${user.client_id}`);

    const { success, data } = await brandRequest(
      `/brands/?client_id=${user.client_id}`,
      "GET"
    );

    console.log(`[getBrandsWithUser] success=${success}, dataLength=${Array.isArray(data) ? data.length : 'not array'}`);

    if (!success) return [];

    if (Array.isArray(data)) {
      return data.toSorted((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    return [];
  } catch (error) {
    console.error(`[getBrandsWithUser] Error:`, error);
    return [];
  }
}

const BATCH_SIZE = 1;
const BATCH_DELAY_MS = 50;

async function processBrandsSequentially(
  brands: any[], 
  clientId: string, 
  accessToken: string
): Promise<any[]> {
  const allResults: any[] = [];
  
  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];
    console.log(`[processBrandsSequentially] Processing brand ${i + 1}/${brands.length}: ${brand?.name}`);
    
    try {
      const enrichedBrand = await enrichBrandWithData(brand, clientId, accessToken);
      allResults.push(enrichedBrand);
      console.log(`[processBrandsSequentially] Brand ${brand?.name}: competitors=${enrichedBrand.competitors?.length || 0}, webStatus=${enrichedBrand.webStatus}, socialStatus=${enrichedBrand.socialStatus}`);
    } catch (error) {
      console.error(`[processBrandsSequentially] Brand ${brand?.name} failed:`, error);
      allResults.push({
        ...brand,
        websiteBatchId: null,
        socialBatchId: null,
        competitors: [],
        webStatus: null,
        socialStatus: null,
        webError: 'Failed to enrich',
        socialError: 'Failed to enrich'
      });
    }
    
    if (i < brands.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
  
  return allResults;
}

export async function getEnrichedBrands() {
  console.log(`[getEnrichedBrands] Starting...`);
  
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log(`[getEnrichedBrands] No access token found`);
    return [];
  }
  console.log(`[getEnrichedBrands] Access token obtained`);

  const user = await getCurrentUser();
  if (!user?.client_id) {
    console.log(`[getEnrichedBrands] No user or client_id`);
    return [];
  }

  console.log(`[getEnrichedBrands] User authenticated: client_id=${user.client_id}`);

  const brands = await getBrandsWithToken(user.client_id, accessToken);
  if (!brands || brands.length === 0) {
    console.log(`[getEnrichedBrands] No brands found`);
    return [];
  }

  console.log(`[getEnrichedBrands] Found ${brands.length} brands, starting SEQUENTIAL enrichment...`);

  const startTime = Date.now();
  
  const enrichedBrands = await processBrandsSequentially(brands, user.client_id, accessToken);
  
  const duration = Date.now() - startTime;

  console.log(`[getEnrichedBrands] All enrichment completed in ${duration}ms`);
  console.log(`[getEnrichedBrands] Returning ${enrichedBrands.length} enriched brands`);
  
  enrichedBrands.forEach((b, i) => {
    console.log(`[getEnrichedBrands] Brand[${i}]: name=${b.name}, competitors=${b.competitors?.length || 0}, webBatchId=${b.websiteBatchId}, socialBatchId=${b.socialBatchId}`);
  });

  return enrichedBrands;
}

export { getBrandsWithUser };



