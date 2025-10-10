import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import { getscrapeBatchWebsite } from '@/server/actions/scrapeActions'
import { getBatchWebsiteReports } from '@/server/actions/reportsActions'
import { parseJsonFromMarkdown } from '@/lib/jsonParser'

export default async function CompetitorPage({ params }: { params: Promise<{ brandId: string; competitorId: string }> }) {

    const { brandId, competitorId } = await params

    await checkAuth()
    const brandData = await getBrandbyIdWithCompetitors(brandId);
    const batchWebsiteScraps = await getscrapeBatchWebsite(brandId);
    const competitorScrapeData = await batchWebsiteScraps.competitors.find((c: any) => c.competitor_id === competitorId)
    const batchWebsiteReports = await getBatchWebsiteReports(brandId);
    const batchCompetitorsWebsiteReports = await batchWebsiteReports.data[0].competitor_reports.find((c: any) => c.competitor_id === competitorId)

    return (
        <DashboardLayout brandData={brandData}>
            <DashboardInnerLayout>
                <BrandDashboard
                    extractorReport={parseJsonFromMarkdown(batchCompetitorsWebsiteReports?.extraction_report.response)}
                    synthesizerReport={batchCompetitorsWebsiteReports?.synthesizer_report.response}
                    title={competitorScrapeData?.name}
                    scrapedData={competitorScrapeData}
                />
            </DashboardInnerLayout>
        </DashboardLayout>
    )
}