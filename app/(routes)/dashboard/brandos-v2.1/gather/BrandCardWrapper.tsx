import { Suspense } from "react";
import { getCompetitors } from "@/server/actions/brandActions";
import { getWebsiteBatchId } from "@/server/actions/ccba/website/websiteScrapeActions";
import { getSocialBatchId } from "@/server/actions/ccba/social/socialScrapeActions";
import { getBatchWebsiteScrapeStatus } from "@/server/actions/ccba/website/websiteStatusAction";
import { getBatchSocialScrapeStatus } from "@/server/actions/ccba/social/socialStatusAction";
import BrandItem from "@/components/brandos-v2.1/gather/BrandItem";
import { 
    CompetitorsSkeleton, 
    CompetitorsTable, 
    StatusBadge, 
    StatusBadgeSkeleton 
} from "@/components/brandos-v2.1/gather/BrandItemParts";


async function CompetitorsFetcher({ brandId }: { brandId: string }) {
    let competitors = [];
    try {
        const res = await getCompetitors(brandId);
        if (res?.competitors) competitors = res.competitors;
    } catch (e) {
        console.error("Competitor fetch error", e);
    }
    return <CompetitorsTable competitors={competitors} />;
}

async function WebStatusFetcher({ brandId, batchId }: { brandId: string, batchId: string }) {
    let status = null;
    try {
        const data = await getBatchWebsiteScrapeStatus(brandId, batchId);
        status = data?.status || null;
    } catch (e) { 
        console.error("Web status fetch error", e); 
    }
    return <StatusBadge type="Website" status={status} />;
}

async function SocialStatusFetcher({ brandId, batchId }: { brandId: string, batchId: string }) {
    let status = null;
    try {
        const data = await getBatchSocialScrapeStatus(brandId, batchId);
        status = data?.status || null;
    } catch (e) { 
        console.error("Social status fetch error", e); 
    }
    return <StatusBadge type="Social" status={status} />;
}

// --- Main Wrapper ---

export async function BrandCardWrapper({ brand, index }: { brand: any, index: number }) {
    // blocked data types
    let websiteBatchId = null;
    let socialBatchId = null;

    try {
        [websiteBatchId, socialBatchId] = await Promise.all([
             getWebsiteBatchId(brand.brand_id).catch(() => null),
             getSocialBatchId(brand.brand_id).catch(() => null)
        ]);
    } catch (e) {
        // ignore errors
    }

    const itemProps = {
        brand,
        websiteBatchId,
        socialBatchId,
        hasData: false, 
        isProcessing: false,
    };

    return (
        <BrandItem 
            item={itemProps} 
            index={index}
            competitorsSlot={
                <Suspense fallback={<CompetitorsSkeleton />}>
                    <CompetitorsFetcher brandId={brand.brand_id} />
                </Suspense>
            }
            webStatusSlot={
                websiteBatchId ? (
                    <Suspense fallback={<StatusBadgeSkeleton />}>
                        <WebStatusFetcher brandId={brand.brand_id} batchId={websiteBatchId} />
                    </Suspense>
                ) : null
            }
            socialStatusSlot={
                 socialBatchId ? (
                    <Suspense fallback={<StatusBadgeSkeleton />}>
                        <SocialStatusFetcher brandId={brand.brand_id} batchId={socialBatchId} />
                    </Suspense>
                ) : null
            }
        />
    );
}
