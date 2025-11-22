"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "@/server/actions/authActions";
import { pollUntilComplete } from "@/lib/utils";
import { getBvoAgentStatus } from "./agenticStatusActions";

export async function initiateBvoAgenticProcess(brand_id: any, bvoPayload: FormData) {
    await getCurrentUser();

    const mode = bvoPayload.get("mode");

    try {
        if (mode === "interactive") {

            const initialResponse = await brandRequest(
                `/bam/agentic`,
                "POST",
                bvoPayload,
            );
            console.log(initialResponse, `<-> /bam/agentic <->`);

            const customInstructions = bvoPayload.get("custom_instructions") as string | null;

            const runPayload: RunInteractiveAgentPayload = {
                agent_id: "1",
                custom_instructions: customInstructions ?? undefined,
            };

            const runResponse = await runInteractiveAgent(initialResponse.session_id, runPayload);
            console.log(runResponse, `<-> /bam/interactive/run <->`);

            return { ...runResponse, session_id: initialResponse.session_id };

        } else {
            console.log(`<-> else mode <->`);

            const response = await brandRequest(
                `/bam/agentic`,
                "POST",
                bvoPayload,
            );

            await pollUntilComplete(
                async () => await getBvoAgentStatus(brand_id, response.task_id),
                (res: any) => res.success && res.data?.status === "Completed"
            );

            return { success: true, data: response };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBvoHistory(brand_id: string) {
    const user = await getCurrentUser();

    try {
        const response = await brandRequest(
            `/bam/agentic?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET",
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBvoHistory:", error);
        return { success: false, error: error.message };
    }
}



export async function getBvoAgentResults(task_id: string, brand_id: string) {
    const user = await getCurrentUser();

    try {
        const response = await brandRequest(
            `/bam/agentic/${task_id}/results?client_id=${user.client_id}&brand_id=${brand_id}`,
            "GET",
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getBvoAgentResults:", error);
        return { success: false, error: error.message };
    }
}

interface RunInteractiveAgentPayload {
    agent_id: string;
    custom_instructions?: string;
}

export async function runInteractiveAgent(session_id: string, payload: RunInteractiveAgentPayload) {
    try {
        const response = await brandRequest(
            `/bam/interactive/${session_id}/run`,
            "POST",
            payload,
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in runInteractiveAgent:", error);
        return { success: false, error: error.message };
    }
}

export async function getInteractiveSessionStatus(session_id: string) {
    try {
        const response = await brandRequest(
            `/bam/interactive/${session_id}/status`,
            "GET",
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in getInteractiveSessionStatus:", error);
        return { success: false, error: error.message };
    }
}

export async function endInteractiveSession(session_id: string) {
    try {
        const response = await brandRequest(
            `/bam/interactive/${session_id}/end`,
            "POST",
        );
        return { success: true, data: response };
    } catch (error: any) {
        console.error("Error in endInteractiveSession:", error);
        return { success: false, error: error.message };
    }
}
