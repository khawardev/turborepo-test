"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { revalidatePath } from "next/cache";

export async function createExtractionReport(payload: any, brand_id: any, competitor_id:any) {
    try {
        const data = await brandRequest("/bedrock-extraction-report", "POST", payload);
        brand_id && revalidatePath(`/ccba/dashboard/brand/${brand_id}`);
        competitor_id && revalidatePath(`/ccba/dashboard/brand/${brand_id}/competitor/${competitor_id}`);
        return { success: true, data };
    } catch (error: any) {
        console.error("createExtractionReport error:", error);
        return { success: false, error: error.message || "Failed to create extraction report" };
    }
}

export async function getBrandExtractionReport(client_id: any,brand_id:any) {
    try {
        const data = await brandRequest(
            `/bedrock-extraction-report?client_id=${client_id}&brand_id=${brand_id}`,
            "GET"
        );
        return { success: true, data };
    } catch (error: any) {
        console.error("getExtractionReport error:", error);
        return { success: false, error: error.message || "Failed to fetch extraction report" };
    }
}

export async function getCompetitorExtractionReport(client_id: any, brand_id: any, competitor_id:any) {
    try {
        const data = await brandRequest(
            `/bedrock-extraction-report?client_id=${client_id}&brand_id=${brand_id}&competitor_id=${competitor_id}`,
            "GET"
        );
        return { success: true, data };
    } catch (error: any) {
        console.error("getExtractionReport error:", error);
        return { success: false, error: error.message || "Failed to fetch extraction report" };
    }
}


