"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { EXTRACTOR_PROMPT, SYNTHESIS_PROMPT } from "@/lib/static/prompts";
import { revalidatePath } from "next/cache";
import { getBatchWebsiteReportsStatus } from "./websiteStatusAction";
import { pollUntilComplete } from "@/lib/utils";
import { getCurrentUser } from "@/server/actions/authActions";

export async function batchWebsiteReports({
    brand_id,
    batch_id,
    model_id,
    sythesizerPrompt,
}: any) {
    const user = await getCurrentUser();

    try {
        const payload = {
            client_id: user.client_id,
            brand_id: brand_id,
            batch_id: batch_id,
            batch_name: `${brand_id}_report`,
            extraction_prompt: EXTRACTOR_PROMPT,
            synthesizer_prompt: sythesizerPrompt ? sythesizerPrompt : SYNTHESIS_PROMPT,
            model_id: `${model_id}`
        };

        const batchReports = await brandRequest("/batch/website-reports", "POST", payload);

        await pollUntilComplete(
            async () => await getBatchWebsiteReportsStatus(brand_id, batchReports.task_id),
            (res:any) => res.success && res.data?.status === "Completed"
        )
        revalidatePath(`/ccba/${brand_id}`);
        return batchReports.task_id
    } catch (error: any) {
        console.error("Error in createBatchWebsiteReports:", error);
        return { success: false, error: error.message };
    }
}


export async function getBatchWebsiteReports(brand_id: string) {
    const user = await getCurrentUser();

    try {
        const response = await brandRequest(
            `/batch/website-reports?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET"
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBatchWebsiteReports:", error);
        return { success: false, error: error.message };
    }
}



