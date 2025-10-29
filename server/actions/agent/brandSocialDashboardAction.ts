"use server";

import { brandRequest } from "@/server/api/brandRequest";
import { cookies } from "next/headers";
import { getCurrentUser } from "../authActions";


export async function getBrandSocialDashboard(brand_id: string) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return { success: false, error: "Unauthorized" };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "User not found" };

    try {
        const response = await brandRequest(
            `/dashboard/${user.client_id}/${brand_id}/BRAND_SOCIAL_DASHBOARD`,
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
