import { z } from "zod";
import { crawlWebsiteSchema } from "@/lib/validations";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://54.221.221.0:8000";

export async function scrapeWebsite(
  data: z.infer<typeof crawlWebsiteSchema>,
) {
  const response = await fetch(`${API_BASE_URL}/website-crawl-spidercrawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to scrape website.");
  }

  return response.json();
}

export async function getScrapedWebsiteContent(
  brand_id: string,
  client_id: string,
  competitor_id?: string,
  url_pattern?: string,
) {
  const params = new URLSearchParams({
    brand_id,
    client_id,
  });

  if (competitor_id) {
    params.append("competitor_id", competitor_id);
  }

  if (url_pattern) {
    params.append("url_pattern", url_pattern);
  }

  const response = await fetch(
    `${API_BASE_URL}/website-crawl-content?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch crawled content.");
  }

  return response.json();
}
