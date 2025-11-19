"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "@/server/actions/authActions";

interface ChatPayload {
    brand_id: string;
    cam_session_id: string;
    question: string;
    additional_instructions?: string;
    uploaded_docs?: string[];
    model_id?: string;
    temperature?: number;
    top_p?: number;
    history_limit?: number;
}

export async function chat(payload: ChatPayload) {
    const user = await getCurrentUser();
    try {
        const response = await brandRequest(
            `/cam/chat/`,
            "POST",
            {
                client_id: user.client_id,
                ...payload,
            },
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in chat:", error);
        return { success: false, error: error.message };
    }
}
