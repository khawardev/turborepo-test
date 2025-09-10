"use server";

import { z } from "zod";

import { FormState } from "@/types";
import { brandSchema } from "@/lib/validations";
import { getErrorMessage } from "@/lib/utils";
import {
  scrapeWebsite,
  getScrapedWebsiteContent,
} from "@/server/services/scrape.service";
import { getCurrentUser } from "./userActions";

const crawlWebsiteSchema = z.object({
  url: z.string().url(),
  brand_id: z.string(),
  client_id: z.string(),
  competitor_id: z.string().optional(),
});

export async function initiateScraping(brand: any, competitors: any[]) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      status: "error",
      message: "User not found.",
    };
  }

  const client_id = user.client_id;
  const brand_id = brand.brand_id;

  try {
    // Scrape brand website
    await scrapeWebsite({
      url: brand.url,
      brand_id,
      client_id,
    });

    // Scrape competitor websites
    if (competitors) {
      for (const competitor of competitors) {
        await scrapeWebsite({
          url: competitor.url,
          brand_id,
          client_id,
          // competitor_id: competitor.id, // Assuming competitor has an id
        });
      }
    }

    return {
      status: "success",
      message: "Website scraping initiated for brand and competitors.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function crawlWebsite(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = brandSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await scrapeWebsite(validatedFields.data);
    if (response.status === "success") {
      return {
        status: "success",
        message: response.message,
      };
    } else {
      return {
        status: "error",
        message: response.message || "Failed to crawl website.",
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function getWebsiteCrawlContent(
  brand_id: string,
  client_id: string,
  competitor_id?: string,
  url_pattern?: string,
) {
  try {
    const content = await getScrapedWebsiteContent(
      brand_id,
      client_id,
      competitor_id,
      url_pattern,
    );
    return {
      status: "success",
      data: content,
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}