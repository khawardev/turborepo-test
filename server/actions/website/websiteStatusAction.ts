"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { cookies } from "next/headers";
import { getCurrentUser } from "../authActions";

export async function getBatchWebsiteScrapeStatus(brand_id: string, scrape_batch_id: string) {
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

    try {
        const result = await brandRequest(`/batch/website-task-status/${scrape_batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`, "GET");

        return { success: true, data: result };
    } catch (error: any) {
        console.error(`Failed to get batch status for batch_id ${scrape_batch_id}:`, error);
        return { success: false, error: error.message || "Failed to get batch status" };
    }
}



export async function getBatchWebsiteReportsStatus(brand_id: string, report_batch_id: string) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return { success: false, error: "Unauthorized" };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "User not found" };

    try {
        const endpoint = `/batch/website-reports-status/${report_batch_id}?client_id=${user.client_id}&brand_id=${brand_id}`;
        const response = await brandRequest(endpoint, "GET");

        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBatchWebsiteReportsStatus:", error);
        return { success: false, error: error.message };
    }
}