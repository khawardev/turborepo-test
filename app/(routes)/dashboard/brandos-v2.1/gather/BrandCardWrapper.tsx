"use client";

import { 
    CompetitorsTable,
    CompetitorsSkeleton
} from "@/components/brandos-v2.1/gather/BrandItemParts";
import BrandItem from "@/components/brandos-v2.1/gather/BrandItem";
import { ScrapeStatusBadge, ScrapeStatusBadgeSkeleton } from "@/components/brandos-v2.1/gather/ScrapeStatusBadge";
import { PollingStatusBadge } from "@/components/brandos-v2.1/gather/PollingStatusBadge";
import { isStatusProcessing } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type BrandCardWrapperProps = {
    brand: any;
    index: number;
}

export function BrandCardWrapper({ brand, index }: BrandCardWrapperProps) {
    const { 
        websiteBatchId, 
        socialBatchId, 
        webStatus, 
        socialStatus, 
        competitors,
        webError,
        socialError 
    } = brand || {};

    const isWebProcessing = isStatusProcessing(webStatus);
    const isSocialProcessing = isStatusProcessing(socialStatus);

    const itemProps = {
        brand,
        websiteBatchId: websiteBatchId || null,
        socialBatchId: socialBatchId || null,
        hasData: false, 
        isProcessing: isWebProcessing || isSocialProcessing,
    };

    const renderWebStatusSlot = () => {
        if (!websiteBatchId) return null;
        
        if (isWebProcessing) {
            return (
                <PollingStatusBadge 
                    type="Website" 
                    initialStatus={webStatus} 
                    initialError={webError}
                    brandId={brand.brand_id}
                    batchId={websiteBatchId}
                />
            );
        }
        
        return (
            <ScrapeStatusBadge 
                label="Website" 
                status={webStatus} 
                error={webError}
            />
        );
    };

    const renderSocialStatusSlot = () => {
        if (!socialBatchId) return null;
        
        if (isSocialProcessing) {
            return (
                <PollingStatusBadge 
                    type="Social" 
                    initialStatus={socialStatus}
                    initialError={socialError}
                    brandId={brand.brand_id}
                    batchId={socialBatchId}
                />
            );
        }
        
        return (
            <ScrapeStatusBadge 
                label="Social" 
                status={socialStatus}
                error={socialError}
            />
        );
    };

    const renderCompetitorsSlot = () => {
        if (competitors === undefined) {
            return <CompetitorsSkeleton />;
        }
        return <CompetitorsTable competitors={competitors || []} />;
    };

    return (
        <BrandItem 
            item={itemProps} 
            index={index}
            competitorsSlot={renderCompetitorsSlot()}
            webStatusSlot={renderWebStatusSlot()}
            socialStatusSlot={renderSocialStatusSlot()}
        />
    );
}
