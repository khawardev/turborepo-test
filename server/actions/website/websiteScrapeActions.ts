"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../authActions";
import { getBatchWebsiteScrapeStatus } from "./websiteStatusAction";
import { SCRAPE, SCRAPING } from "@/lib/constants";
import { pollUntilComplete } from "@/lib/utils";
import { getAuthUser } from "@/lib/static/getAuthUser";

export async function scrapeBatchWebsite(brand_id: any, limit: any) {
    const user = await getAuthUser()

    try {
        const scrapePayload = {
            client_id: user.client_id,
            brand_id: brand_id,
            limit: limit,
            name: `${brand_id} - website Capture`,
        }

        const batchWebsiteScrape = await brandRequest("/batch/website", "POST", scrapePayload)

        await pollUntilComplete(
            async () => await getBatchWebsiteScrapeStatus(brand_id, batchWebsiteScrape.task_id),
            (res) => res.success && res.data?.status === "Completed"
        )
        
        revalidatePath(`/ccba/${brand_id}`)
        return { success: true, message: `${SCRAPING} and report extraction completed successfully ` }
    } catch (error: any) {
        console.error(`Failed batch ${SCRAPE} for brand ${brand_id}:`, error)
        return { success: false, error: error.message || `Batch ${SCRAPING} failed` }
    }
}



export async function getscrapeBatchWebsite(brand_id: string, batch_id: any) {
    const user = await getAuthUser();
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
        console.error(`Failed to fetch ${SCRAPE} results for batch_id ${batch_id}:`, error);
        return { success: false, error: error.message || `Failed to fetch ${SCRAPE} results` };
    }
}



export async function getWebsiteBatchId(client_id: string, brand_id: string) {
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


export async function getpreviousWebsiteScraps(client_id: string, brand_id: string) {
    try {
        const response = await brandRequest(`/batch/website-scrapes?client_id=${client_id}&brand_id=${brand_id}`, "GET", undefined, 'force-cache')
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