import { ActiveTasksBanner } from "@/components/brandos-v2.1/gather/ActiveTasksBanner";
import { isStatusProcessing } from "@/lib/utils";


export async function ActiveTasksBannerWrapper({ brands }: { brands: any[] }) {

    const processingBrands = brands.filter((brand) => {
        const isWebProcessing = isStatusProcessing(brand.webStatus);
        const isSocialProcessing = isStatusProcessing(brand.socialStatus);
        return isWebProcessing || isSocialProcessing;
    }).map((brand) => ({
        brand,
        hasData: false,
        isProcessing: true,
        websiteBatchId: brand.websiteBatchId,
        socialBatchId: brand.socialBatchId,
        webStatus: brand.webStatus,
        socialStatus: brand.socialStatus,
        webError: brand.webError,
        socialError: brand.socialError
    }));

    return <ActiveTasksBanner initialProcessingBrands={processingBrands} />;
}
