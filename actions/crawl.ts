'use server';
import { Spider } from "@spider-cloud/spider-client";

export async function crawlWebsite(url:any) {

    if (!url || typeof url !== 'string') {
        return { error: 'Invalid URL provided.' };
    }

    try {
        const spider = new Spider({ apiKey: process.env.SPIDER_API_KEY! });

        const crawlParams:any = {
            limit: 10,
            depth: 3,
            return_format: 'markdown',
        };

        const crawlResults:any = await spider.crawlUrl(url, crawlParams);

        const combinedContent = crawlResults
            .filter((result:any) => result.status === 200 && result.content)
            .map((result: any) => `## URL: ${result.url}\n\n${result.content}`)
            .join('\n\n---\n\n');

        if (!combinedContent) {
            return { error: 'Not able to get the usable audit contet' };
        }

        return { content: combinedContent };
    } catch (error: any) {
        return { error: error.message || 'Crawling failed.' };
    }
}
