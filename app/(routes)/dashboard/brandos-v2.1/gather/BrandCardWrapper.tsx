import { 
    CompetitorsTable,
} from "@/components/brandos-v2.1/gather/BrandItemParts";
import BrandItem from "@/components/brandos-v2.1/gather/BrandItem";
import { ScrapeStatusBadge } from "@/components/brandos-v2.1/gather/ScrapeStatusBadge";
import { PollingStatusBadge } from "@/components/brandos-v2.1/gather/PollingStatusBadge";
import { isStatusProcessing } from "@/lib/utils";

export async function BrandCardWrapper({ brand, index }: { brand: any, index: number }) {
    const { 
        websiteBatchId, 
        socialBatchId, 
        webStatus, 
        socialStatus, 
        competitors,
        webError,
        socialError 
    } = brand;

    const isWebProcessing = isStatusProcessing(webStatus);
    const isSocialProcessing = isStatusProcessing(socialStatus);

    const itemProps = {
        brand,
        websiteBatchId,
        socialBatchId,
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

    return (
        <BrandItem 
            item={itemProps} 
            index={index}
            competitorsSlot={<CompetitorsTable competitors={competitors || []} />}
            webStatusSlot={renderWebStatusSlot()}
            socialStatusSlot={renderSocialStatusSlot()}
        />
    );
}
