"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { revalidatePath } from "next/cache";
import { SCRAPING } from "@/lib/constants";
import { getCurrentUser } from "@/server/actions/authActions";

export async function scrapeBatchWebsite(brand_id: any, limit: any) {
    try {
        const user = await getCurrentUser();

        const scrapePayload = {
            client_id: user.client_id,
            brand_id: brand_id,
            limit: limit,
            name: `${brand_id} - website Capture`,
        }

        const { success, data, error } = await brandRequest("/batch/website", "POST", scrapePayload);

        if (!success) return { success: false, message: error };

        revalidatePath(`/dashboard/ccba/${brand_id}`);
        return { success: true, message: `${SCRAPING} and report extraction  successfully`, data };
    } catch {
        return { success: false, message: `Batch ${SCRAPING} failed` };
    }
}



export async function getscrapeBatchWebsite(brand_id: string, batch_id: any) {
    try {
        const user = await getCurrentUser();

        if (!batch_id) {
            return { success: false, message: "No batch_id found for this brand." };
        }

        const { success, data, error } = await brandRequest(
            `/batch/website-scrape-results?client_id=${user.client_id}&brand_id=${brand_id}&batch_id=${batch_id}`,
            "GET"
        );

        if (!success) return null;

        return data;
    } catch (error) {
        return null;
    }
}



export async function getWebsiteBatchId(brand_id: string) {
    try {
        const user = await getCurrentUser();

        const { success, data, error } = await brandRequest(`/batch/website-scrapes?client_id=${user.client_id}&brand_id=${brand_id}`, "GET");

        if (!success) return null;

        if (!Array.isArray(data) || data.length === 0) return { success: true, data: null };
        const latest = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return latest?.batch_id;
    } catch {
        return null;
    }
}


export async function getpreviousWebsiteScraps(brand_id: string) {
    try {
        const user = await getCurrentUser();


        const { success, data, error } = await brandRequest(`/batch/website-scrapes?client_id=${user.client_id}&brand_id=${brand_id}`, "GET", undefined, 'force-cache');

        if (!success) return null;
        if (!Array.isArray(data) || data.length === 0) return { success: true, data: [] };

        const filtered = data.map((item: any) => ({
            brand_id: item.brand_id,
            client_id: item.client_id,
            created_at: item.created_at,
            status: item.status,
            scraped_pages: item.scraped_pages,
            batch_id: item.batch_id
        }));

        return filtered;
    } catch {
        return null;
    }
}