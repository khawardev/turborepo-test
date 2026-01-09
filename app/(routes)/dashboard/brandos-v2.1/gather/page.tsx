import { redirect } from 'next/navigation';
import { getBrands, getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getWebsiteBatchId } from "@/server/actions/ccba/website/websiteScrapeActions";
import { getSocialBatchId } from "@/server/actions/ccba/social/socialScrapeActions";
import { getCurrentUser } from "@/server/actions/authActions";
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { getBatchWebsiteScrapeStatus } from '@/server/actions/ccba/website/websiteStatusAction';
import { getBatchSocialScrapeStatus } from '@/server/actions/ccba/social/socialStatusAction';
import { ActiveTasksBanner } from '@/components/brandos-v2.1/gather/ActiveTasksBanner';
import { GatherBrandList } from '@/components/brandos-v2.1/gather/BrandList';

type GatherBrand = {
    brand: any;
    hasData: boolean;
    isProcessing: boolean;
    websiteBatchId: string | null;
    socialBatchId: string | null;
};

async function fetchBrandsWithStatus(): Promise<GatherBrand[]> {
    const brands = await getBrands();

    if (!brands || brands.length === 0) return [];

    const brandsData = await Promise.all(
        brands.map(async (brand: any) => {
            const brandData = await getBrandbyIdWithCompetitors(brand?.brand_id);
            const websiteBatchId = await getWebsiteBatchId(brandData?.brand_id);
            const socialBatchId = await getSocialBatchId(brandData?.brand_id);

            let isProcessing = false;
            let hasData = false;

            if (websiteBatchId) {
                const webStatus = await getBatchWebsiteScrapeStatus(brandData.brand_id, websiteBatchId);
                const isWebComplete = webStatus?.status === 'Completed' || webStatus?.status === 'CompletedWithErrors';
                if (isWebComplete) hasData = true;
                if (!isWebComplete && webStatus?.status) isProcessing = true;
            }

            if (socialBatchId) {
                const socialStatus = await getBatchSocialScrapeStatus(brandData.brand_id, socialBatchId);
                const isSocialComplete = socialStatus?.status === 'Completed' || socialStatus?.status === 'CompletedWithErrors';
                if (isSocialComplete) hasData = true;
                if (!isSocialComplete && socialStatus?.status) isProcessing = true;
            }

            return {
                brand: brandData,
                hasData,
                isProcessing,
                websiteBatchId,
                socialBatchId,
            };
        })
    );

    return brandsData.filter((item) => item && item.brand);
}

export default async function GatherPage() {
    await getCurrentUser();
    const brandsWithStatus = await fetchBrandsWithStatus();

    const processingBrands = brandsWithStatus.filter(b => b.isProcessing);

    return (
        <div className="space-y-6">
            <DashboardLayoutHeading
                title="Data Gathering"
                subtitle="Manage data collection and view captured content for your brands."
            />
            <div className="w-full max-w-6xl mx-auto px-6 pb-12 space-y-8">
                {processingBrands.length > 0 && (
                    <ActiveTasksBanner processingBrands={processingBrands} />
                )}
                <GatherBrandList brandsData={brandsWithStatus} />
            </div>
        </div>
    );
}
