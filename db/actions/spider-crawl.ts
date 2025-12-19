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

        const urls = crawlData.map((page: any) => page.url);
        const allPagesDataString = crawlData.map((page: any) => {
            const cleanContent = (page.content || '').replace(/\s+/g, ' ').trim();
            let pageContent = `\n[PAGE]: ${page.url}\n`;
            pageContent += `[CONTENT]: ${cleanContent}\n`;
            
            if (page.metadata && Object.keys(page.metadata).length > 0) {
                pageContent += `[META]: ${JSON.stringify(page.metadata)}\n`;
            }
            return pageContent;
        }).join('---\n');

        logger.info("Spider crawl successful, all page content combined.", { url, pageCount: crawlData.length });
        return { content: allPagesDataString, urls };
    } catch (error: any) {
        logger.error("Spider crawl API call failed.", { functionName, url, errorMessage: error.message, errorDetails: error });
        return {
            error: error.message || 'An unknown error occurred during the website crawl.',
            details: error.cause || null
        };
    }
}