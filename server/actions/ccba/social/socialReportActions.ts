"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SOCIAL_SYNTHESIS_PROMPT } from "@/lib/static/prompts";
import { getBatchSocialReportsStatus } from "./socialStatusAction";
import { pollUntilComplete } from "@/lib/utils";
import { getCurrentUser } from "@/server/actions/authActions";

export async function batchSocialReports({
    brand_id,
    batch_id,
    model_id,
    social_prompt,
}: any) {
    const user = await getCurrentUser();

    try {
        const payload = {
            client_id: user.client_id,
            brand_id: brand_id,
            batch_id: batch_id,
            batch_name: `${brand_id} - website Report`,
            social_prompt: social_prompt ? social_prompt : SOCIAL_SYNTHESIS_PROMPT,
            model_id: model_id,
        };

        const batchReports = await brandRequest("/batch/social-reports", "POST", payload);


        await pollUntilComplete(
            async () => await getBatchSocialReportsStatus(brand_id, batchReports.task_id),
            (res: any) => res.success && res.data?.status === "Completed"
        );

        revalidatePath(`/ccba/${brand_id}`);
        return { success: true, data: batchReports.task_id };
    } catch (error: any) {
        console.error("Error in batchSocialReports:", error);
        return { success: false, error: error.message };
    }
}

export async function getBatchSocialReports(brand_id: string) {
    const user = await getCurrentUser();

    try {
        const response = await brandRequest(
            `/batch/social-reports?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET"
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBatchSocialReports:", error);
        return { success: false, error: error.message };
    }
}