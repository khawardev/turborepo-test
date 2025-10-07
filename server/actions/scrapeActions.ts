"use server";

import { revalidatePath } from "next/cache";
import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";
import { getClientDetails } from "./brandActions";

type ScrapeWebsiteParams = {
  url: string;
  brand_id: string;
  competitor_id?: string;
};

export async function scrapeBatchWebsite(brand: any) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to batch scrape website.");
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }

  try {
    const payload = {
      client_id: user.client_id,
      brand_id: brand.brand_id,
      limit: 5,
      name: `${brand.name}_scrape`,
    };

    await brandRequest("/batch/website", "POST", {
      body: JSON.stringify(payload),
    });

    const maxRetries = 30;
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (let i = 0; i < maxRetries; i++) {
      const statusRes = await getBatchWebsiteTaskStatus(brand.brand_id);
      if (!statusRes.success) return statusRes;
      const status = statusRes.data?.status?.toLowerCase?.();
      if (status === "completed") {
        return { success: true, data: statusRes.data, message: "Scraping completed" };
      }
      if (status === "failed") {
        return { success: false, error: "Scraping failed" };
      }
      await delay(5000); 
    }

    return { success: false, error: "Scraping timed out" };
  } catch (error: any) {
    console.error(`Failed to start batch scrape for brand ${brand.brand_id}:`, error);
    return { success: false, error: error.message || "Batch scraping failed to start" };
  }
}

export async function getBatchWebsiteTaskStatus(brand_id: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to check batch status.");
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const batch_id = await getBatchId(user.client_id, brand_id);
  try {
    const result = await brandRequest(`/batch/website-task-status/${batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`, "GET");
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Failed to get batch status for batch_id ${batch_id}:`, error);
    return { success: false, error: error.message || "Failed to get batch status" };
  }
}

export async function scrapeWebsite(params: ScrapeWebsiteParams) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to scrape website.");
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();

  const { url, brand_id, competitor_id } = params;

  try {
    const payload = {
      limit: 1,
      url,
      brand_id,
      client_id: user.client_id,
      ...(competitor_id && { competitor_id }),
    };

    const result = await brandRequest("/website-crawl-spidercrawl", "POST", {
      body: JSON.stringify(payload),
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Failed to scrape website for URL ${url}:`, error);
    return { success: false, error: error.message || "Scraping failed" };
  }
}

export async function getBulkWebsiteCrawlContent(brand_id: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to get crawl content.");
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();

  try {
    const result = await brandRequest(
      `/bulk-website-crawl-content/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Failed to get bulk crawl content for brand ${brand_id}:`, error);
    return { success: false, error: error.message || "Failed to fetch content" };
  }
}




export async function getBatchId(client_id: string, brand_id: string) {
  try {
    const response = await brandRequest(`/batch/website-scrapes?client_id=${client_id}&brand_id=${brand_id}`, "GET")
    
    if (!Array.isArray(response) || response.length === 0) return null
    const latest = response.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    
    return latest?.batch_id || null
  } catch (error) {
    console.error("Error fetching batch_id:", error)
    return null
  }
}