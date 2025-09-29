import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

async function request(endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: any) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
        throw new Error("Unauthorized");
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.detail || "API request failed");
    }
    return data;
}

type BrandPayload = {
    client_id: string;
    name: string;
    url: string;
    facebook_url?: string;
    linkedin_url?: string;
    x_url?: string;
    youtube_url?: string;
    instagram_url?: string;
};

type CompetitorPayload = {
    competitor_id: string;
    name: string;
    url: string;
    facebook_url?: string;
    linkedin_url?: string;
    x_url?: string;
    youtube_url?: string;
    instagram_url?: string;
};

type CompetitorsPayload = {
    brand_id: string;
    client_id: string;
    competitors: CompetitorPayload[];
};

type CrawlWebsitePayload = {
    limit: number;
    url: string;
    brand_id: string;
    client_id: string;
    competitor_id?: string;
};

export const api = {
    getBrands: (clientId: string, brandId?: string) => {
        const url = new URL(`${API_URL}/brands/`);
        url.searchParams.append("client_id", clientId);
        if (brandId) { url.searchParams.append("brand_id", brandId); }
        return request(url.pathname + url.search, "GET");
    },

    getCompetitors: (clientId: string, brandId: string) => {
        const url = new URL(`${API_URL}/brands/competitors/?client_id=${clientId}&brand_id=${brandId}`);
        return request(url.pathname + url.search, "GET");
    },

    createBrand: (data: BrandPayload) => request("/brands/", "POST", data),

    createCompetitors: (data: CompetitorsPayload) => request("/brands/competitors/", "POST", data),

    crawlWebsite: (data: CrawlWebsitePayload) => request("/website-crawl-spidercrawl", "POST", data),

    getBulkCrawlContent: (clientId: string, brandId: string) => {
        const url = new URL(`${API_URL}/bulk-website-crawl-content/?client_id=${clientId}&brand_id=${brandId}`);
        return request(url.pathname + url.search, "GET");
    },

    deleteBrand: (clientId: string, brandId: string) => {
        const url = new URL(`${API_URL}/brands/?client_id=${clientId}&brand_id=${brandId}`);
        return request(url.pathname + url.search, "DELETE");
    },
};