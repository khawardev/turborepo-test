import { redirect } from 'next/navigation';
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions';
import { getpreviousWebsiteScraps, getscrapeBatchWebsite } from '@/server/actions/ccba/website/websiteScrapeActions';
import { getPreviousSocialScrapes, getScrapeBatchSocial } from '@/server/actions/ccba/social/socialScrapeActions';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { DashboardInnerLayout } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { DataViewManager } from '@/components/brandos-v2.1/gather/data/DataViewManager';

type PageProps = {
    params: Promise<{ brandId: string }>;
};

async function fetchScrapedData(brandId: string) {
    let websiteData = null;
    let socialData = null;
    let websiteBatchId = null;
    let socialBatchId = null;
    let websiteBatchStatus = null;
    let socialBatchStatus = null;

    try {
        const prevWeb = await getpreviousWebsiteScraps(brandId);
        if (Array.isArray(prevWeb) && prevWeb.length > 0) {
            const sorted = prevWeb.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const completedBatch = sorted.find(
                (b: any) => b.status === 'Completed' || b.status === 'CompletedWithErrors'
            );

            if (completedBatch) {
                websiteBatchId = completedBatch.batch_id;
                websiteBatchStatus = completedBatch.status;
                websiteData = await getscrapeBatchWebsite(brandId, completedBatch.batch_id);
            }
        }
    } catch (e) {
        console.error("[DataPage] Error fetching website data:", e);
    }

    try {
        const prevSocial = await getPreviousSocialScrapes(brandId);
        if (Array.isArray(prevSocial) && prevSocial.length > 0) {
            const sorted = prevSocial.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const completedBatch = sorted.find(
                (b: any) => b.status === 'Completed' || b.status === 'CompletedWithErrors'
            );

            if (completedBatch) {
                socialBatchId = completedBatch.batch_id;
                socialBatchStatus = completedBatch.status;
                socialData = await getScrapeBatchSocial(brandId, completedBatch.batch_id);
            }
        }
    } catch (e) {
        console.error("[DataPage] Error fetching social data:", e);
    }

    return { websiteData, socialData, websiteBatchId, socialBatchId, websiteBatchStatus, socialBatchStatus };
}

export default async function DataPage({ params }: PageProps) {
    const { brandId } = await params;

    if (!brandId) {
        redirect('/dashboard/brandos-v2.1/gather');
    }

    const brandData = await getBrandbyIdWithCompetitors(brandId);

    if (!brandData) {
        redirect('/dashboard/brandos-v2.1/gather');
    }

    const {
        websiteData,
        socialData,
        websiteBatchId,
        socialBatchId,
        websiteBatchStatus,
        socialBatchStatus
    } = await fetchScrapedData(brandId);

    const hasData = !!(websiteData || socialData);

    if (!hasData) {
        redirect(`/dashboard/brandos-v2.1/gather/collecting/${brandId}`);
    }

    return (
        <div className="space-y-6">
            <DashboardLayoutHeading
                title={`Data: ${brandData.name}`}
                subtitle="View and analyze captured data from web and social sources."
            />
            <DashboardInnerLayout>
                <DataViewManager
                    brandId={brandId}
                    brandData={brandData}
                    websiteData={websiteData}
                    socialData={socialData}
                    websiteBatchId={websiteBatchId}
                    socialBatchId={socialBatchId}
                    websiteBatchStatus={websiteBatchStatus}
                    socialBatchStatus={socialBatchStatus}
                />
            </DashboardInnerLayout>
        </div>
    );
}
