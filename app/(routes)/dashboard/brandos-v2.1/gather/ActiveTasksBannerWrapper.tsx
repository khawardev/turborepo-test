import { getWebsiteBatchId } from "@/server/actions/ccba/website/websiteScrapeActions";
import { getSocialBatchId } from "@/server/actions/ccba/social/socialScrapeActions";
import { getBatchWebsiteScrapeStatus } from "@/server/actions/ccba/website/websiteStatusAction";
import { getBatchSocialScrapeStatus } from "@/server/actions/ccba/social/socialStatusAction";
import { ActiveTasksBanner } from "@/components/brandos-v2.1/gather/ActiveTasksBanner";

// Re-use chunk/retry logic or just chunking since we are batch processing again
async function fetchProcessingBrands(brands: any[]) {
     const chunkArray = (arr: any[], size: number) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
            arr.slice(i * size, i * size + size)
        );

    const processingBrands: any[] = [];
    const chunks = chunkArray(brands, 3);

    for (const chunk of chunks) {
        const chunkResults = await Promise.all(
            chunk.map(async (brand: any) => {
                // We only need processing status here, not full competitors.
                // So we skip getCompetitors to be faster.
                
                let websiteBatchId = null;
                try {
                     websiteBatchId = await getWebsiteBatchId(brand.brand_id);
                } catch (e) { console.error(`Error fetching web batch`, e) }
                
                let socialBatchId = null;
                try {
                     socialBatchId = await getSocialBatchId(brand.brand_id);
                } catch (e) { console.error(`Error fetching social batch`, e) }

                let isProcessing = false;
                
                if (websiteBatchId) {
                    try {
                        const webStatus = await getBatchWebsiteScrapeStatus(brand.brand_id, websiteBatchId);
                        const isWebComplete = webStatus?.status === 'Completed' || webStatus?.status === 'CompletedWithErrors' || webStatus?.status === 'Failed';
                        if (!isWebComplete && webStatus?.status) isProcessing = true;
                    } catch (e) {}
                }

                if (!isProcessing && socialBatchId) {
                    try {
                        const socialStatus = await getBatchSocialScrapeStatus(brand.brand_id, socialBatchId);
                         const isSocialComplete = socialStatus?.status === 'Completed' || socialStatus?.status === 'CompletedWithErrors' || socialStatus?.status === 'Failed';
                        if (!isSocialComplete && socialStatus?.status) isProcessing = true;
                    } catch (e) {}
                }

                if (isProcessing) {
                    return {
                        brand,
                        hasData: false, // Not needed for banner
                        isProcessing: true,
                        websiteBatchId,
                        socialBatchId
                    };
                }
                return null;
            })
        );
        processingBrands.push(...chunkResults.filter(Boolean));
    }
    return processingBrands;
}

export async function ActiveTasksBannerWrapper({ brands }: { brands: any[] }) {
    const processingBrands = await fetchProcessingBrands(brands);
    return <ActiveTasksBanner processingBrands={processingBrands} />;
}
