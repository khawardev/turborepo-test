import { brandRequest } from "../../server/api/brandRequest";
const API_URL = process.env.API_URL;

export const api = {
    getBrands: (clientId: string, brandId?: string) => {
        const url = new URL(`${API_URL}/brands/?client_id=${clientId}${brandId ? `&brand_id=${brandId}` : ""}`);
        return brandRequest(url.pathname + url.search, "GET");
    },

    getCompetitors: (clientId: string, brandId: string) => {
        const url = new URL(`${API_URL}/brands/competitors/?client_id=${clientId}&brand_id=${brandId}`);
        return brandRequest(url.pathname + url.search, "GET");
    },

    createBrand: (data: any) => brandRequest("/brands/", "POST", data),

    createCompetitors: (data: any) => brandRequest("/brands/competitors/", "POST", data),

    crawlWebsite: (data: any) => brandRequest("/website-crawl-spidercrawl", "POST", data),

    getBulkCrawlContent: (clientId: string, brandId: string) => {
        const url = new URL(`${API_URL}/bulk-website-crawl-content/?client_id=${clientId}&brand_id=${brandId}`);
        return brandRequest(url.pathname + url.search, "GET");
    },

    deleteBrand: (clientId: string, brandId: string) => {
        const url = new URL(`${API_URL}/brands/?client_id=${clientId}&brand_id=${brandId}`);
        return brandRequest(url.pathname + url.search, "DELETE");
    },
};