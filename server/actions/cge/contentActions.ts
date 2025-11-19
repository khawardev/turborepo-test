"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "@/server/actions/authActions";

interface ContentGenerationPayload {
    brand_id: string;
    cam_session_id: string;
    additional_instructions: string;
    uploaded_docs?: string[];
    model_id?: string;
}

export async function generateContent(payload: ContentGenerationPayload) {
    const user = await getCurrentUser();
    try {
        const response = await brandRequest(
            `/cam/content/`,
            "POST",
            {
                client_id: user.client_id,
                ...payload,
            },
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in generateContent:", error);
        return { success: false, error: error.message };
    }
}

interface ContentRevisionPayload {
    brand_id: string;
    cam_session_id: string;
    original_content: string;
    user_feedback: string;
    model_id?: string;
}

export async function reviseContent(payload: ContentRevisionPayload) {
    const user = await getCurrentUser();
    try {
        const response = await brandRequest(
            `/cam/revise/`,
            "POST",
            {
                client_id: user.client_id,
                ...payload,
            },
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in reviseContent:", error);
        return { success: false, error: error.message };
    }
}
