import { Spider } from '@spider-cloud/spider-client';
import { logger } from "@/lib/utils";

export async function spiderCrawlWebsite(url: any, limit:any) {
    const functionName = "crawlWebsite";
    logger.info("Spider crawl initiated.", { url });

    if (!url || typeof url !== 'string') {
        logger.warn("Invalid URL provided for crawling.", { functionName, urlProvided: url });
        return { error: 'A valid URL must be provided.' };
    }

    try {
        const app = new Spider({ apiKey: process.env.SPIDER_API_KEY! });

        const crawlParams = {
            limit: limit,
            metadata: false
        };

        const crawlData = await app.crawlUrl(url, crawlParams);

        if (!crawlData || crawlData.length === 0) {
            throw new Error("Crawl failed or returned no data.");
        }

        const allPagesDataString = crawlData.map((page: any) => {
            let pageContent = `\n\n--- Page Data Start ---\n\n`;
            pageContent += `Content for page: ${page.url || 'N/A'}\n\n`;
            pageContent += `${page.content || 'No content.'}\n\n`;

            pageContent += `Metadata for page: ${page.url || 'N/A'}\n\n`;
            if (page.metadata) {
                for (const key in page.metadata) {
                    if (Object.prototype.hasOwnProperty.call(page.metadata, key)) {
                        const value = page.metadata[key];
                        pageContent += `${key}: ${JSON.stringify(value)}\n`;
                    }
                }
            } else {
                pageContent += 'No metadata available for this page.\n';
            }

            pageContent += `\n--- Page Data End ---\n`;
            return pageContent;
        }).join('');

        logger.info("Spider crawl successful, all page content combined.", { url });
        return { content: allPagesDataString };

    } catch (error: any) {
        logger.error("Spider crawl API call failed.", { functionName, url, errorMessage: error.message, errorDetails: error });
        return {
            error: error.message || 'An unknown error occurred during the website crawl.',
            details: error.cause || null
        };
    }
}