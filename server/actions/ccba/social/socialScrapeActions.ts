"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { revalidatePath } from "next/cache";
import { SCRAPE, SCRAPING } from "@/lib/constants";
import { getCurrentUser } from "@/server/actions/authActions";

export async function scrapeBatchSocial(
    brand_id: any,
    start_date: string,
    end_date: string
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.client_id) {
            console.error("[scrapeBatchSocial] User not authenticated or missing client_id");
            return { success: false, message: "User not authenticated" };
        }

        const scrapePayload = {
            client_id: user.client_id,
            brand_id: brand_id,
            name: `social_scrape_${brand_id}`,
            start_date: start_date,
            end_date: end_date,
        }

        console.log("[scrapeBatchSocial] Payload:", scrapePayload);

        const { success, data, error } = await brandRequest("/batch/social", "POST", scrapePayload);

        console.log("[scrapeBatchSocial] Response:", { success, data, error });

        if (!success) return { success: false, message: error };

        revalidatePath(`/dashboard/ccba/${brand_id}`);
        revalidatePath(`/dashboard/brandos-v2.1/gather`);
        return { success: true, message: `Social ${SCRAPING} started successfully`, data };
    } catch (error: any) {
        console.error(`[scrapeBatchSocial] Error for brand ${brand_id}:`, error);
        return { success: false, message: `Batch social ${SCRAPING} failed` };
    }
}

export async function getSocialBatchStatus(brand_id: string, batch_id: string) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.client_id) return null;

        console.log("[getSocialBatchStatus] Checking status for batch:", batch_id);

        const { success, data, error } = await brandRequest(
            `/batch/social-task-status/${batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET"
        );

        console.log("[getSocialBatchStatus] Response:", { success, data, error });

        if (!success) return null;

        return data;
    } catch (error) {
        console.error("[getSocialBatchStatus] Error:", error);
        return null;
    }
}

export async function getScrapeBatchSocial(brand_id: string, batch_id: any) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.client_id) return null;

        if (!batch_id) {
            console.warn("[getScrapeBatchSocial] No batch_id provided");
            return null;
        }

        console.log("[getScrapeBatchSocial] Fetching results for batch:", batch_id);

        const { success, data, error } = await brandRequest(
            `/batch/social-scrape-results?client_id=${user.client_id}&brand_id=${brand_id}&batch_id=${batch_id}`,
            "GET"
        );

        console.log("[getScrapeBatchSocial] Response success:", success, "Has data:", !!data);

        if (!success) return null;

        return data;
    } catch (error) {
        console.error("[getScrapeBatchSocial] Error:", error);
        return null;
    }
}

export async function getPreviousSocialScrapes(brand_id: string) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.client_id) return null;

        console.log("[getPreviousSocialScrapes] Fetching for brand:", brand_id);

        const { success, data, error } = await brandRequest(
            `/batch/social-scrapes?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET",
            undefined,
            'no-store'
        );

        console.log("[getPreviousSocialScrapes] Response:", { success, count: data?.length, error });

        if (!success) return null;
        if (!Array.isArray(data) || data.length === 0) return [];

        const filtered = data.map((item: any) => ({
            brand_id: item.brand_id,
            client_id: item.client_id,
            created_at: item.created_at,
            status: item.status,
            batch_id: item.batch_id,
            start_date: item.start_date,
            end_date: item.end_date,
        }));

        console.log("[getPreviousSocialScrapes] Latest batch:", filtered[0]);

        return filtered;
    } catch (error) {
        console.error("[getPreviousSocialScrapes] Error:", error);
        return null;
    }
}

export async function getSocialBatchId(brand_id: string) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.client_id) return null;

        const { success, data, error } = await brandRequest(
            `/batch/social-scrapes?client_id=${user.client_id}&brand_id=${brand_id}`, 
            "GET"
        );

        if (!success) return null;
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return latest?.batch_id || null;
    } catch (error) {
        console.error("[getSocialBatchId] Error:", error);
        return null;
    }
}