import { getCcbaTaskStatus } from '@/server/actions/ccba/statusActions';
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions';
import { getpreviousWebsiteScraps, getscrapeBatchWebsite } from '@/server/actions/ccba/website/websiteScrapeActions';
import { getPreviousSocialScrapes, getScrapeBatchSocial } from '@/server/actions/ccba/social/socialScrapeActions';
import { DashboardInnerLayout } from './shared/DashboardComponents';
import { GatherManager } from './gather/GatherManager';

interface GatherDashboardProps {
    brandId: string;
    startDate?: string;
    endDate?: string;
    webLimit?: string;
}

export default async function GatherDashboard({ brandId, startDate, endDate, webLimit }: GatherDashboardProps) {
    console.log("========== GatherDashboard Server Render ==========");
    console.log("[GatherDashboard] Props:", { brandId, startDate, endDate, webLimit });

    if (!brandId) {
        console.error("[GatherDashboard] No Brand ID provided");
        return <div>No Brand ID provided</div>;
    }

    let status = null;
    let brandData = null;
    let websiteData = null;
    let socialData = null;
    let websiteBatchStatus = null;
    let socialBatchStatus = null;
    let websiteBatchId = null;
    let socialBatchId = null;

    // 1. Fetch Status
    try {
        status = await getCcbaTaskStatus(brandId);
        console.log("[GatherDashboard] Task Status:", status);
    } catch (e) {
        console.error("[GatherDashboard] Error fetching status:", e);
    }

    // 2. Fetch Brand Data
    try {
        brandData = await getBrandbyIdWithCompetitors(brandId);
        console.log("[GatherDashboard] Brand Data:", brandData ? { name: brandData.name, competitors: brandData.competitors?.length } : null);
    } catch (e) {
        console.error("[GatherDashboard] Error fetching brand:", e);
    }

    // 3. Fetch Latest Website Scraps
    try {
        const prevWeb = await getpreviousWebsiteScraps(brandId);
        console.log("[GatherDashboard] Previous Website Scraps Count:", prevWeb?.length || 0);
        
        if (Array.isArray(prevWeb) && prevWeb.length > 0) {
            const sorted = prevWeb.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const latestWeb = sorted[0];
            
            console.log("[GatherDashboard] Latest Website Batch:", {
                batch_id: latestWeb.batch_id,
                status: latestWeb.status,
                created_at: latestWeb.created_at
            });
            
            websiteBatchStatus = latestWeb.status;
            websiteBatchId = latestWeb.batch_id;
            
            if (latestWeb.status === 'Completed' || latestWeb.status === 'CompletedWithErrors') {
                console.log("[GatherDashboard] Website batch completed, fetching results...");
                const fullWebData = await getscrapeBatchWebsite(brandId, latestWeb.batch_id);
                if (fullWebData) {
                    websiteData = fullWebData;
                    console.log("[GatherDashboard] Website Data fetched:", {
                        hasBrand: !!fullWebData.brand,
                        competitorCount: fullWebData.competitors?.length || 0
                    });
                } else {
                    console.warn("[GatherDashboard] No website data returned for completed batch");
                }
            } else {
                console.log("[GatherDashboard] Website batch not completed, status:", latestWeb.status);
            }
        } else {
            console.log("[GatherDashboard] No previous website scraps found");
        }
    } catch (e) {
        console.error("[GatherDashboard] Error fetching website scraps:", e);
    }

    // 4. Fetch Latest Social Scraps
    try {
        const prevSocial = await getPreviousSocialScrapes(brandId);
        console.log("[GatherDashboard] Previous Social Scraps Count:", prevSocial?.length || 0);
        
        if (Array.isArray(prevSocial) && prevSocial.length > 0) {
            const sorted = prevSocial.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const latestSocial = sorted[0];
            
            console.log("[GatherDashboard] Latest Social Batch:", {
                batch_id: latestSocial.batch_id,
                status: latestSocial.status,
                created_at: latestSocial.created_at
            });
            
            socialBatchStatus = latestSocial.status;
            socialBatchId = latestSocial.batch_id;
            
            if (latestSocial.status === 'Completed' || latestSocial.status === 'CompletedWithErrors') {
                console.log("[GatherDashboard] Social batch completed, fetching results...");
                const fullSocialData = await getScrapeBatchSocial(brandId, latestSocial.batch_id);
                if (fullSocialData) {
                    socialData = fullSocialData;
                    console.log("[GatherDashboard] Social Data fetched:", {
                        hasBrand: !!fullSocialData.brand,
                        competitorCount: fullSocialData.competitors?.length || 0
                    });
                } else {
                    console.warn("[GatherDashboard] No social data returned for completed batch");
                }
            } else {
                console.log("[GatherDashboard] Social batch not completed, status:", latestSocial.status);
            }
        } else {
            console.log("[GatherDashboard] No previous social scraps found");
        }
    } catch (e) {
        console.error("[GatherDashboard] Error fetching social scraps:", e);
    }

    console.log("[GatherDashboard] Final State:", {
        hasStatus: !!status,
        hasBrandData: !!brandData,
        hasWebsiteData: !!websiteData,
        hasSocialData: !!socialData,
        websiteBatchStatus,
        socialBatchStatus,
        websiteBatchId,
        socialBatchId
    });
    console.log("========== GatherDashboard Server Render Complete ==========");

    return (
        <DashboardInnerLayout>
            <GatherManager 
                brandId={brandId}
                initialStatus={status}
                brandData={brandData}
                websiteData={websiteData}
                socialData={socialData}
                websiteBatchStatus={websiteBatchStatus}
                socialBatchStatus={socialBatchStatus}
                websiteBatchId={websiteBatchId}
                socialBatchId={socialBatchId}
                webLimit={webLimit ? parseInt(webLimit) : 10}
                startDate={startDate || ''}
                endDate={endDate || ''}
            />
        </DashboardInnerLayout>
    );
}
