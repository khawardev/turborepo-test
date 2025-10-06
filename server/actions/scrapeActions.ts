"use server";

import { revalidatePath } from "next/cache";
import { brandRequest } from "@/server/api/brandRequest";
import { getCurrentUser } from "./authActions";
import { cookies } from "next/headers";

type ScrapeWebsiteParams = {
  url: string;
  brand_id: string;
  competitor_id?: string;
};

export async function scrapeBrandAndCompetitors(
  brand: any,
  competitors: any[]
) {
  try {
    await Promise.all([
      scrapeWebsite({
        url: brand.url,
        brand_id: brand.brand_id,
      }),
      ...competitors.map((competitor) =>
        scrapeWebsite({
          url: competitor.url,
          brand_id: brand.brand_id,
          competitor_id: competitor.competitor_id,
        })
      ),
    ]);

    revalidatePath("/brands");
    return { success: true };
  } catch (error) {
    console.error(
      `Scraping failed for brand ${brand.brand_id} and competitors:`,
      error
    );
    return { success: false, error: "Scraping failed" };
  }
}

export async function scrapeWebsite(params: ScrapeWebsiteParams) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to scrape website.");
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();

  const { url, brand_id, competitor_id } = params;

  try {
    const payload = {
      limit: 1,
      url,
      brand_id,
      client_id: user.client_id,
      ...(competitor_id && { competitor_id }),
    };

    const result = await brandRequest("/website-crawl-spidercrawl", "POST", {
      body: JSON.stringify(payload),
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Failed to scrape website for URL ${url}:`, error);
    return { success: false, error: error.message || "Scraping failed" };
  }
}

export async function getBulkWebsiteCrawlContent(brand_id: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error("Unauthorized attempt to get crawl content.");
    return { success: false, error: "Unauthorized" };
  }
  const user = await getCurrentUser();

  try {
    const result = await brandRequest(
      `/bulk-website-crawl-content/?client_id=${user.client_id}&brand_id=${brand_id}`,
      "GET"
    );
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Failed to get bulk crawl content for brand ${brand_id}:`, error);
    return { success: false, error: error.message || "Failed to fetch content" };
  }
}