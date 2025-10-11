"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";
import { EXTRACTOR_PROMPT, SYNTHESIS_PROMPT } from "@/lib/prompt";

export async function batchWebsiteReports(brand_id: any, batch_id: any) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return { success: false, error: "Unauthorized" };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "User not found" };

    try {

        const payload = {
            client_id: user.client_id,
            brand_id: brand_id,
            batch_id: batch_id,
            batch_name: `${brand_id}_scrape`,
            extraction_prompt: EXTRACTOR_PROMPT,
            synthesizer_prompt: SYNTHESIS_PROMPT,
            model_id: "claude-4-1-opus"
        };

        const response = await brandRequest("/batch/website-reports", "POST", payload);
        return response;
    } catch (error: any) {
        console.error("Error in createBatchWebsiteReports:", error);
        return { success: false, error: error.message };
    }
}


export async function getBatchWebsiteReports(brand_id: string) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return { success: false, error: "Unauthorized" };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "User not found" };

    try {
        const response = await brandRequest(
            `/batch/website-reports?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET",
            undefined,
            "force-cache"
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBatchWebsiteReports:", error);
        return { success: false, error: error.message };
    }
}



export async function getBrandPerceptionReport(brand_id: string) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return { success: false, error: "Unauthorized" };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "User not found" };

    try {
        const response = await brandRequest(
            `/dashboard/${user.client_id}/${brand_id}/BRAND_PERCEPTION`,
            "GET",
            undefined,
            'force-cache'
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBrandPerceptionReport:", error);
        return { success: false, error: error.message };
    }
}
