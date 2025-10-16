import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import { getBatchId, getscrapeBatchWebsite } from '@/server/actions/scrapeActions'
import { getBatchWebsiteReports, getBrandPerceptionReport } from '@/server/actions/reportsActions'
import { parseJsonFromMarkdown } from '@/lib/jsonParser'
import { prioritizeBrandReport } from '@/lib/prioritizeBrandReport'
import { getCurrentUser } from '@/server/actions/authActions'

export default async function CompetitorPage({ params }: { params: Promise<{ brandId: string; competitorId: string }> }) {
    const { brandId, competitorId } = await params

    await checkAuth()
    const user = await getCurrentUser()
    const brandData = await getBrandbyIdWithCompetitors(brandId);
    const batch_id = await getBatchId(user.client_id, brandId);
    const batchWebsiteScraps = await getscrapeBatchWebsite(brandId, batch_id);
    const batchWebsiteReports = await getBatchWebsiteReports(brandId);
    const batchCompetitorsWebsiteReports = await batchWebsiteReports.data[0].competitor_reports.find((c: any) => c.competitor_id === competitorId)
    const brandPerceptionReport = await getBrandPerceptionReport(brandId);
    const prioritizedReport = prioritizeBrandReport(brandPerceptionReport.data, brandData.name);
 
    const sortedReports = batchWebsiteReports?.data
        ? [...batchWebsiteReports.data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        : []
    
    const competitorWebsiteScraps = await batchWebsiteScraps.competitors.find((c: any) => c.competitor_id === competitorId)

    return (
        <DashboardLayout brandData={brandData}>
            <DashboardInnerLayout>
               <BrandDashboard
                    extractorReport={sortedReports?.[0].competitor_reports?.[0]?.extraction_report?.response ? parseJsonFromMarkdown(sortedReports?.[0].competitor_reports?.[0]?.extraction_report?.response) : null}
                    synthesizerReport={
                        sortedReports?.[0].competitor_reports?.[0]?.synthesizer_report?.response ?? null
                    }
                    title={competitorWebsiteScraps?.name}
                    brandPerceptionReport={prioritizedReport}
                    scrapedData={competitorWebsiteScraps}
                /> 
            </DashboardInnerLayout>
        </DashboardLayout>
    )
}