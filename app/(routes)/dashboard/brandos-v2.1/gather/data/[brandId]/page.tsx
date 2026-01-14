import { redirect } from 'next/navigation';
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions';
import { getpreviousWebsiteScraps } from '@/server/actions/ccba/website/websiteScrapeActions';
import { getPreviousSocialScrapes } from '@/server/actions/ccba/social/socialScrapeActions';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { DashboardInnerLayout } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { DataViewManager } from '@/components/brandos-v2.1/gather/data/DataViewManager';
import { Suspense } from 'react';
import { WebsiteResultsWrapper } from './WebsiteResultsWrapper';
import { SocialResultsWrapper } from './SocialResultsWrapper';
import { Skeleton } from '@/components/ui/skeleton';

type PageProps = {
    params: Promise<{ brandId: string }>;
};

async function fetchScrapedMetaData(brandId: string) {
    let websiteBatchId = null;
    let socialBatchId = null;
    let websiteBatchStatus = null;
    let socialBatchStatus = null;

    // Parallel fetch metadata
    try {
        const [prevWeb, prevSocial] = await Promise.all([
            getpreviousWebsiteScraps(brandId).catch(() => null),
            getPreviousSocialScrapes(brandId).catch(() => null)
        ]);

        if (Array.isArray(prevWeb) && prevWeb.length > 0) {
            const sorted = prevWeb.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Prefer completed, but take latest
            const completedBatch = sorted.find(
                (b: any) => b.status === 'Completed' || b.status === 'CompletedWithErrors'
            );
            // Default to latest if none completed (to show pending status)
            const targetBatch = completedBatch || sorted[0];

            if (targetBatch) {
                websiteBatchId = targetBatch.batch_id;
                websiteBatchStatus = targetBatch.status;
            }
        }

        if (Array.isArray(prevSocial) && prevSocial.length > 0) {
            const sorted = prevSocial.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const completedBatch = sorted.find(
                (b: any) => b.status === 'Completed' || b.status === 'CompletedWithErrors'
            );
            const targetBatch = completedBatch || sorted[0];

            if (targetBatch) {
                socialBatchId = targetBatch.batch_id;
                socialBatchStatus = targetBatch.status;
            }
        }
    } catch (e) {
        console.error("[DataPage] Error fetching metadata:", e);
    }

    return { websiteBatchId, socialBatchId, websiteBatchStatus, socialBatchStatus };
}

function getDerivedChannels(brandData: any): string[] {
    const channels: string[] = [];
    if (!brandData) return channels;
    if (brandData.linkedin_url) channels.push('linkedin');
    if (brandData.facebook_url) channels.push('facebook');
    if (brandData.instagram_url) channels.push('instagram');
    if (brandData.x_url) channels.push('x');
    if (brandData.youtube_url) channels.push('youtube');
    if (brandData.tiktok_url) channels.push('tiktok');
    
    // Also add competitor channels if needed, but typically we analyze the main brand first.
    return channels;
}

export default async function DataPage({ params }: PageProps) {
    const { brandId } = await params;

    if (!brandId) {
        redirect('/dashboard/brandos-v2.1/gather');
    }

    // 1. Fetch lightweight brand data first (Blocking - required for Title)
    const brandData = await getBrandbyIdWithCompetitors(brandId);
    if (!brandData) {
        redirect('/dashboard/brandos-v2.1/gather');
    }

    // 2. Fetch lightweight metadata (Blocking - required for Tab State)
    const {
        websiteBatchId,
        socialBatchId,
        websiteBatchStatus,
        socialBatchStatus
    } = await fetchScrapedMetaData(brandId);

    const hasResults = !!(websiteBatchId || socialBatchId);

    // 3. Compute static channels
    const availableChannels = getDerivedChannels(brandData);

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
                    isWebComplete={websiteBatchStatus === 'Completed' || websiteBatchStatus === 'CompletedWithErrors'}
                    isSocialComplete={socialBatchStatus === 'Completed' || socialBatchStatus === 'CompletedWithErrors'}
                    websiteSlot={
                        <Suspense fallback={<div className="space-y-4">
                            <Skeleton className="h-10 w-full max-w-sm" />
                            <div className="grid grid-cols-4 gap-6">
                                <div className="space-y-2"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
                                <div className="col-span-3"><Skeleton className="h-96 w-full" /></div>
                            </div>
                        </div>}>
                            <WebsiteResultsWrapper 
                                brandId={brandId} 
                                batchId={websiteBatchId} 
                                brandName={brandData.name}
                                status={websiteBatchStatus}
                            />
                        </Suspense>
                    }
                    socialSlot={
                         <Suspense fallback={<div className="space-y-4">
                            <Skeleton className="h-10 w-full max-w-sm" />
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
                            </div>
                            <Skeleton className="h-96 w-full" />
                        </div>}>
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

