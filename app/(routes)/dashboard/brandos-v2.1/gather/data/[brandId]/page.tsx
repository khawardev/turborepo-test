import { redirect } from 'next/navigation';
import { cache, Suspense } from 'react';
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions';
import { getpreviousWebsiteScraps } from '@/server/actions/ccba/website/websiteScrapeActions';
import { getPreviousSocialScrapes } from '@/server/actions/ccba/social/socialScrapeActions';
import { DashboardLayoutHeading, DashboardInnerLayout } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { DataViewManager } from '@/components/brandos-v2.1/gather/data/DataViewManager';
import { WebsiteResultsWrapper } from './WebsiteResultsWrapper';
import { SocialResultsWrapper } from './SocialResultsWrapper';
import { Skeleton } from '@/components/ui/skeleton';

type PageProps = {
    params: Promise<{ brandId: string }>;
};

type BatchMetaData = {
    websiteBatchId: string | null;
    socialBatchId: string | null;
    websiteBatchStatus: string | null;
    socialBatchStatus: string | null;
};

const getBrandData = cache(async (brandId: string) => {
    return getBrandbyIdWithCompetitors(brandId);
});

async function fetchScrapedMetaData(brandId: string): Promise<BatchMetaData> {
    const [prevWeb, prevSocial] = await Promise.all([
        getpreviousWebsiteScraps(brandId).catch(() => null),
        getPreviousSocialScrapes(brandId).catch(() => null)
    ]);

    let websiteBatchId: string | null = null;
    let socialBatchId: string | null = null;
    let websiteBatchStatus: string | null = null;
    let socialBatchStatus: string | null = null;

    if (Array.isArray(prevWeb) && prevWeb.length > 0) {
        const sorted = prevWeb.toSorted((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const completedBatch = sorted.find(
            (b: any) => b.status === 'Completed' || b.status === 'CompletedWithErrors'
        );
        const targetBatch = completedBatch ?? sorted[0];
        websiteBatchId = targetBatch?.batch_id ?? null;
        websiteBatchStatus = targetBatch?.status ?? null;
    }

    if (Array.isArray(prevSocial) && prevSocial.length > 0) {
        const sorted = prevSocial.toSorted((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const completedBatch = sorted.find(
            (b: any) => b.status === 'Completed' || b.status === 'CompletedWithErrors'
        );
        const targetBatch = completedBatch ?? sorted[0];
        socialBatchId = targetBatch?.batch_id ?? null;
        socialBatchStatus = targetBatch?.status ?? null;
    }

    return { websiteBatchId, socialBatchId, websiteBatchStatus, socialBatchStatus };
}

function getDerivedChannels(brandData: any): string[] {
    if (!brandData) return [];
    
    const channelMap: Record<string, string> = {
        linkedin_url: 'linkedin',
        facebook_url: 'facebook',
        instagram_url: 'instagram',
        x_url: 'x',
        youtube_url: 'youtube',
        tiktok_url: 'tiktok'
    };
    
    return Object.entries(channelMap)
        .filter(([key]) => brandData[key])
        .map(([, channel]) => channel);
}

function isCompleteStatus(status: string | null): boolean {
    return status === 'Completed' || status === 'CompletedWithErrors';
}

const WebsiteSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <div className="col-span-3">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    </div>
);

const SocialSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid grid-cols-3 gap-4 mb-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>
);

export default async function DataPage({ params }: PageProps) {
    const { brandId } = await params;

    if (!brandId) {
        redirect('/dashboard/brandos-v2.1/gather');
    }

    const [brandData, batchMeta] = await Promise.all([
        getBrandData(brandId),
        fetchScrapedMetaData(brandId)
    ]);

    if (!brandData) {
        redirect('/dashboard/brandos-v2.1/gather');
    }

    const { websiteBatchId, socialBatchId, websiteBatchStatus, socialBatchStatus } = batchMeta;
    const hasResults = Boolean(websiteBatchId || socialBatchId);
    const availableChannels = getDerivedChannels(brandData);
    const isWebComplete = isCompleteStatus(websiteBatchStatus);
    const isSocialComplete = isCompleteStatus(socialBatchStatus);

    return (
        <div className="space-y-6">
            <DashboardLayoutHeading
                title={brandData.name}
                subtitle="View and analyze captured data from web and social sources."
            />
            <DashboardInnerLayout>
                <DataViewManager
                    brandId={brandId}
                    brandData={brandData}
                    websiteBatchId={websiteBatchId}
                    socialBatchId={socialBatchId}
                    websiteBatchStatus={websiteBatchStatus}
                    socialBatchStatus={socialBatchStatus}
                    availableChannels={availableChannels}
                    hasResults={hasResults}
                    isWebComplete={isWebComplete}
                    isSocialComplete={isSocialComplete}
                    websiteSlot={
                        <Suspense fallback={<WebsiteSkeleton />}>
                            <WebsiteResultsWrapper 
                                brandId={brandId} 
                                batchId={websiteBatchId} 
                                brandName={brandData.name}
                                status={websiteBatchStatus}
                            />
                        </Suspense>
                    }
                    socialSlot={
                        <Suspense fallback={<SocialSkeleton />}>
                            <SocialResultsWrapper 
                                brandId={brandId} 
                                batchId={socialBatchId} 
                                brandName={brandData.name}
                                brandData={brandData}
                                status={socialBatchStatus}
                            />
                        </Suspense>
                    }
                />
            </DashboardInnerLayout>
        </div>
    );
}

