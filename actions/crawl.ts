import FirecrawlApp from '@mendable/firecrawl-js';
import { logger } from "@/lib/utils";

export async function crawlWebsite(url: any) {
    const functionName = "crawlWebsite";
    logger.info("Crawl initiated.", { url });

    if (!url || typeof url !== 'string') {
        logger.warn("Invalid URL provided for crawling.", { functionName, urlProvided: url });
        return { error: 'A valid URL must be provided.' };
    }

    try {
        const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
        const crawlResponse: any = await app.crawlUrl(url, {
            limit: 10,
            maxDepth:3,
            scrapeOptions: {
                formats: ['markdown'],
            }
        })

        if (!crawlResponse.success) {
            throw new Error(`Failed to crawl: ${crawlResponse.error}`)
        }
     
        logger.info("Crawl successful, content combined.", {  url});
        return { content: crawlResponse?.data[0].markdown };

    } catch (error: any) {
        logger.error("Spider crawl API call failed.", { functionName, url, errorMessage: error.message, errorDetails: error });
        return {
            error: error.message || 'An unknown error occurred during the website crawl.',
            details: error.cause || null
        };
    }
}