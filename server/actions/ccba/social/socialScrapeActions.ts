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

        const scrapePayload = {
            client_id: user.client_id,
            brand_id: brand_id,
            name: `social_scrape_${brand_id}`,
            start_date: start_date,
            end_date: end_date,
        }

        const { success, data, error } = await brandRequest("/batch/social", "POST", scrapePayload);

        if (!success) return { success: false, message: error };

        revalidatePath(`/dashboard/ccba/${brand_id}`);
        return { success: true, message: `Social ${SCRAPING} started successfully`, data };
    } catch (error: any) {
        console.error(`Failed batch social ${SCRAPE} for brand ${brand_id}:`, error);
        return { success: false, message: `Batch social ${SCRAPING} failed` };
    }
}


export async function getScrapeBatchSocial(brand_id: string, batch_id: any) {
    try {
        const user = await getCurrentUser();

        if (!batch_id) {
            return { success: false, message: "No batch_id found for this brand." };
        }

        const { success, data, error } = await brandRequest(
            `/batch/social-scrape-results?client_id=${user.client_id}&brand_id=${brand_id}&batch_id=${batch_id}`,
            "GET"
        );

        if (!success) return null;

        return data;
    } catch (error) {
        return null;
    }
}



export async function getPreviousSocialScrapes(brand_id: string) {
    try {
        const user = await getCurrentUser();

        const { success, data, error } = await brandRequest(
            `/batch/social-scrapes?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET"
        );

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

        return filtered;
    } catch (error) {
        console.error("Error fetching previous social captures:", error);
        return null;
    }
}



export async function getSocialBatchId(brand_id: string) {
    try {
        const user = await getCurrentUser();


        const { success, data, error } = await brandRequest(`/batch/social-scrapes?client_id=${user.client_id}&brand_id=${brand_id}`, "GET");

        if (!success) return null;
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return latest?.batch_id || null;
    } catch (error) {
        console.error("Error fetching batch_id:", error);
        return null;
    }
}