"use server";

import { revalidatePath } from "next/cache";
import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";
import { getClientDetails } from "./brandActions";


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

export async function getBatchWebsiteScrapeResults(brand_id: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to fetch scrape results.");
    return { success: false, error: "Unauthorized" };
  }

  const user = await getCurrentUser();


  const batch_id = await getBatchId(user.client_id, brand_id);
  if (!batch_id) {
    return { success: false, error: "No batch_id found for this brand." };
  }

  try {
    const result = await brandRequest(
      `/batch/website-scrape-results?client_id=${user.client_id}&brand_id=${brand_id}&batch_id=${batch_id}`,
      "GET"
    );
    return  result;
  } catch (error: any) {
    console.error(`Failed to fetch scrape results for batch_id ${batch_id}:`, error);
    return { success: false, error: error.message || "Failed to fetch scrape results" };
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