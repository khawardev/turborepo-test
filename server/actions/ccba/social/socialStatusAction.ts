"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { SCRAPE } from "@/lib/constants";
import { getCurrentUser } from "@/server/actions/authActions";

export async function getBatchSocialScrapeStatus(brand_id: any, batch_id: any) {
    const user = await getCurrentUser()

    try {
        const status = await brandRequest(
            `/batch/social-task-status/${batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET"
        )
        return { success: true, data: status };
    } catch (error: any) {
        console.error(`Failed to fetch status for social ${SCRAPE} batch ${batch_id}:`, error)
        return { success: false, error: error.message || "Failed to fetch status" }
    }
}


export async function getBatchSocialReportsStatus(brand_id: string, batch_id: string) {
    const user = await getCurrentUser();

    try {
        const response = await brandRequest(
            `/batch/social-reports-status/${batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET"
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBatchSocialReportsStatus:", error);
        return { success: false, error: error.message };
    }
}