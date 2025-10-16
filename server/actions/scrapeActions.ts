"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { batchWebsiteReports } from "./reportsActions";
import { pollUntilComplete } from "@/lib/pollUntilComplete";
import { getBatchWebsiteReportsStatus, getBatchWebsiteScrapeStatus } from "./statusActions";

export async function scrapeBatchandExtractionWebsite(brand_id: any) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value
  if (!accessToken) return { success: false, error: "Unauthorized" }

  const user = await getCurrentUser()
  if (!user) return { success: false, error: "User not found" }

  try {
    const scrapePayload = {
      client_id: user.client_id,
      brand_id: brand_id,
      limit: 5,
      name: `${brand_id}_scrape`,
    }

    const batchWebsiteScrape = await brandRequest("/batch/website", "POST", scrapePayload)

    await pollUntilComplete(
      async () => await getBatchWebsiteScrapeStatus(brand_id, batchWebsiteScrape.task_id),
      (res) => res.success && res.data?.status === "Completed"
    )
    // const batchReports = await batchWebsiteReports(brand_id, batchWebsiteScrape.task_id)

    // await pollUntilComplete(
    //   async () => await getBatchWebsiteReportsStatus(brand_id, batchReports.task_id),
    //   (res) => res.success && res.data?.status === "Completed"
    // )
    revalidatePath(`/brands`)
    return { success: true, message: "Scraping and report extraction completed successfully 🎉" }
  } catch (error: any) {
    console.error(`Failed batch scrape for brand ${brand_id}:`, error)
    return { success: false, error: error.message || "Batch scraping failed" }
  }
}


export async function scrapeBatchWebsite(brand_id: any, limit:any) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value
  if (!accessToken) return { success: false, error: "Unauthorized" }

  const user = await getCurrentUser()
  if (!user) return { success: false, error: "User not found" }

  try {
    const scrapePayload = {
      client_id: user.client_id,
      brand_id: brand_id,
      limit: limit,
      name: `${brand_id}_scrape`,
    }

    const batchWebsiteScrape = await brandRequest("/batch/website", "POST", scrapePayload)

    await pollUntilComplete(
      async () => await getBatchWebsiteScrapeStatus(brand_id, batchWebsiteScrape.task_id),
      (res) => res.success && res.data?.status === "Completed"
    )
   
    revalidatePath(`/brands/${brand_id}`)
    return { success: true, message: "Scraping and report extraction completed successfully 🎉" }
  } catch (error: any) {
    console.error(`Failed batch scrape for brand ${brand_id}:`, error)
    return { success: false, error: error.message || "Batch scraping failed" }
  }
}





export async function getscrapeBatchWebsite(brand_id: string, batch_id:any) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to fetch scrape results.");
    return { success: false, error: "Unauthorized" };
  }

  const user = await getCurrentUser();
  if (!batch_id) {
    return { success: false, error: "No batch_id found for this brand." };
  }

  try {
    const result = await brandRequest(
      `/batch/website-scrape-results?client_id=${user.client_id}&brand_id=${brand_id}&batch_id=${batch_id}`,
      "GET"
      , undefined, 'force-cache'
    );
    return result;
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


export async function getpreviousScraps(client_id: string, brand_id: string) {
  try {
    const response = await brandRequest(`/batch/website-scrapes?client_id=${client_id}&brand_id=${brand_id}`, "GET")
    if (!Array.isArray(response) || response.length === 0) return []

    const filtered = response.map((item: any) => ({
      brand_id: item.brand_id,
      client_id: item.client_id,
      created_at: item.created_at,
      status: item.status,
      scraped_pages: item.scraped_pages,
      batch_id: item.batch_id
    }))

    return filtered
  } catch (error) {
    console.error("Error fetching batch data:", error)
    return []
  }
}

