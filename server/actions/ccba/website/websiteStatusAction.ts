"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "@/server/actions/authActions";

export async function getBatchWebsiteScrapeStatus(brand_id: string, batch_id: string) {
    const user = await getCurrentUser();
    
    try {
        const result = await brandRequest(`/batch/website-task-status/${batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`, "GET");

        return { success: true, data: result };
    } catch (error: any) {
        console.error(`Failed to get batch status for batch_id ${batch_id}:`, error);
        return { success: false, error: error.message || "Failed to get batch status" };
    }
}


export async function getBatchWebsiteReportsStatus(brand_id: string, batch_id: string) {
    const user = await getCurrentUser();

    try {
        const endpoint = `/batch/website-reports-status/${batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`;
        const response = await brandRequest(endpoint, "GET");

        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBatchWebsiteReportsStatus:", error);
        return { success: false, error: error.message };
    }
}