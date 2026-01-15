
import { 
    CompetitorsTable, 
    StatusBadge,
    PollingStatusBadge
} from "@/components/brandos-v2.1/gather/BrandItemParts";
import BrandItem from "@/components/brandos-v2.1/gather/BrandItem";

function isStatusProcessing(status: string | null): boolean {
    if (!status) return false;
    const completedStatuses = ['Completed', 'CompletedWithErrors', 'Failed'];
    return !completedStatuses.includes(status);
}

export async function BrandCardWrapper({ brand, index }: { brand: any, index: number }) {
    const { websiteBatchId, socialBatchId, webStatus, socialStatus, competitors } = brand;

    const isWebProcessing = isStatusProcessing(webStatus);
    const isSocialProcessing = isStatusProcessing(socialStatus);

    const itemProps = {
        brand,
        websiteBatchId,
        socialBatchId,
        hasData: false, 
        isProcessing: isWebProcessing || isSocialProcessing,
    };

    return (
        <BrandItem 
            item={itemProps} 
            index={index}
            competitorsSlot={
                <CompetitorsTable competitors={competitors || []} />
            }
            webStatusSlot={
                websiteBatchId ? (
                    isWebProcessing ? (
                        <PollingStatusBadge 
                            type="Website" 
                            initialStatus={webStatus} 
                            brandId={brand.brand_id}
                            batchId={websiteBatchId}
                        />
                    ) : (
                        <StatusBadge type="Website" status={webStatus} />
                    )
                ) : null
            }
            socialStatusSlot={
                 socialBatchId ? (
                    isSocialProcessing ? (
                        <PollingStatusBadge 
                            type="Social" 
                            initialStatus={socialStatus} 
                            brandId={brand.brand_id}
                            batchId={socialBatchId}
                        />
                    ) : (
                        <StatusBadge type="Social" status={socialStatus} />
                    )
                ) : null
            }
        />
    );
}
