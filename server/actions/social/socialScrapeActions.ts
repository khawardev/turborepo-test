"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { pollUntilComplete } from "@/lib/pollUntilComplete";
import { getCurrentUser } from "../authActions";
import { getBatchSocialScrapeStatus } from "./socialStatusAction";
import { SCRAPE, SCRAPING } from "@/lib/constants";

export async function scrapeBatchSocial(
    brand_id: any,
    start_date: string,
    end_date: string
) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value
    if (!accessToken) return { success: false, error: "Unauthorized" }

    const user = await getCurrentUser()
    if (!user) return { success: false, error: "User not found" }

    try {
        const scrapePayload = {
            client_id: user.client_id,
            brand_id: brand_id,
            name: `social_scrape_${brand_id}`,
            start_date: start_date,
            end_date: end_date,
        }

        const initialResponse = await brandRequest("/batch/social", "POST", scrapePayload)
        
        await pollUntilComplete(
            async () => await getBatchSocialScrapeStatus(brand_id, initialResponse.batch_id),
            (res: any) => res.success && res.data?.status === "Completed"
        )

        revalidatePath(`/brands/${brand_id}`)
        return { success: true, message: `Social ${SCRAPING} completed successfully 🎉` }
    } catch (error: any) {
        console.error(`Failed batch social ${SCRAPE} for brand ${brand_id}:`, error)
        return { success: false, error: error.message || `Batch social ${SCRAPING} failed` }
    }
}


export async function getScrapeBatchSocial(brand_id: string, batch_id: any) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
        console.error(`Unauthorized attempt to fetch social ${SCRAPE} results.`)
        return { success: false, error: "Unauthorized" }
    }

    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: "User not found" }
    }

    if (!batch_id) {
        return { success: false, error: "No batch_id provided." }
    }

    try {
        const result = await brandRequest(
            `/batch/social-scrape-results?client_id=${user.client_id}&brand_id=${brand_id}&batch_id=${batch_id}`,
            "GET",
        )
        
        return result
    } catch (error: any) {
        console.error(`Failed to fetch social ${SCRAPE} results for batch_id ${batch_id}:`, error)
        return { success: false, error: error.message || `Failed to fetch social ${SCRAPE} results` }
    }
}



export async function getPreviousSocialScrapes(client_id: string, brand_id: string) {
    try {
        const response = await brandRequest(
            `/batch/social-scrapes?client_id=${client_id}&brand_id=${brand_id}`,
            "GET",
        )

        if (!Array.isArray(response) || response.length === 0) {
            return []
        }

        const filtered = response.map((item: any) => ({
            brand_id: item.brand_id,
            client_id: item.client_id,
            created_at: item.created_at,
            status: item.status,
            batch_id: item.batch_id,
            start_date: item.start_date,
            end_date: item.end_date,
        }))

        return filtered
    } catch (error) {
        console.error("Error fetching previous social scrapes:", error)
        return []
    }
}



export async function getSocialBatchId(client_id: string, brand_id: string) {
    try {
        const response = await brandRequest(`/batch/social-scrapes?client_id=${client_id}&brand_id=${brand_id}`, "GET")
        if (!Array.isArray(response) || response.length === 0) return null
        const latest = response.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

        return latest?.batch_id || null
    } catch (error) {
        console.error("Error fetching batch_id:", error)
        return null
    }
}