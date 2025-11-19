"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "@/server/actions/authActions";

export async function getBvoAgentStatus(brand_id: string, task_id: string,) {
    const user = await getCurrentUser();

    try {
        const response = await brandRequest(
            `/bam/agentic/${task_id}/status?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET",
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBvoAgentStatus:", error);
        return { success: false, error: error.message };
    }
}