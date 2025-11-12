"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { getAuthUser } from "@/lib/static/getAuthUser";


export async function getBrandPerceptionReport(brand_id: string) {
    const user = await getAuthUser();

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
