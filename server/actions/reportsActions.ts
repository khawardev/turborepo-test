"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";
import { EXTRACTOR_PROMPT, SYNTHESIS_PROMPT } from "@/lib/prompt";
import { pollUntilComplete } from "@/lib/pollUntilComplete";
import { getBatchWebsiteReportsStatus } from "./statusActions";
import { revalidatePath } from "next/cache";

export async function genrateReports({
    brand_id,
    batch_id,
    selectedModel,
    sythesizerPrompt,
}: any) {
    const batchReports = await batchWebsiteReports(brand_id, batch_id, selectedModel, sythesizerPrompt)

    await pollUntilComplete(
        async () => await getBatchWebsiteReportsStatus(brand_id, batchReports.task_id),
        (res) => res.success && res.data?.status === "Completed"
    )
    revalidatePath(`/brands/${brand_id}`);
    return batchReports.task_id
}

export async function batchWebsiteReports(brand_id: any, batch_id: any, selectedModel: any, sythesizerPrompt: any) {
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
            synthesizer_prompt: sythesizerPrompt ? sythesizerPrompt : SYNTHESIS_PROMPT,
            model_id: `${selectedModel}`
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
