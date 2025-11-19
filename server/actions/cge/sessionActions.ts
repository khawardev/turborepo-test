"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "@/server/actions/authActions";

export async function createCamKnowledgeBase(brand_id: string, bam_session_id: string) {
    const user = await getCurrentUser();
    try {
        const response = await brandRequest(
            `/cam/knowledge-base/`,
            "POST",
            {
                client_id: user.client_id,
                brand_id,
                bam_session_id,
            },
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in createCamKnowledgeBase:", error);
        return { success: false, error: error.message };
    }
}

export async function getCamSessions(brand_id: string) {
    const user = await getCurrentUser();
    try {
        const response = await brandRequest(
            `/cam/sessions?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET",
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getCamSessions:", error);
        return { success: false, error: error.message };
    }
}
