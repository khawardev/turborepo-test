import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import { parseJsonFromMarkdown } from '@/lib/jsonParser'
import { prioritizeBrandReport } from '@/lib/prioritizeBrandReport'
import { getCurrentUser } from '@/server/actions/authActions'
import { getWebsiteBatchId, getscrapeBatchWebsite } from '@/server/actions/website/websiteScrapeActions'
import { getScrapeBatchSocial, getSocialBatchId } from '@/server/actions/social/socialScrapeActions'
import { getBatchWebsiteReports, getBrandPerceptionReport } from '@/server/actions/website/websiteReportActions'
import { getBatchSocialReports } from '@/server/actions/social/socialReportActions'

export default async function CompetitorPage({params}: {params: Promise<{ brandId: string; competitorId: string }>}) {
    const { brandId, competitorId } = await params

    await checkAuth()
    const user = await getCurrentUser()
    const brandData = await getBrandbyIdWithCompetitors(brandId)

    const websiteBatchId = await getWebsiteBatchId(user.client_id, brandId)
    const websiteScrapsData = await getscrapeBatchWebsite(brandId, websiteBatchId)
    const competitorWebsiteScraps = websiteScrapsData.competitors.find((c: any) => c.competitor_id === competitorId)

    const websiteReportsData = await getBatchWebsiteReports(brandId)
    const latestWebsiteReports = websiteReportsData?.data? [...websiteReportsData.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()): []
    const latestCompetitorWebsiteReport = latestWebsiteReports?.[0]?.competitor_reports?.find((report: any) => report.competitor_id === competitorId)

    const socialBatchId = await getSocialBatchId(user.client_id, brandId)
    const socialScrapsData = await getScrapeBatchSocial(brandId, socialBatchId)
    const competitorSocialScraps = socialScrapsData.competitors.find((c: any) => c.competitor_id === competitorId)

    const socialReportsData: any = await getBatchSocialReports(brandId)
    const latestSocialReports = socialReportsData?.data?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const latestCompetitorSocialReport = latestSocialReports?.[0]?.competitor_reports?.find((report: any) => report.competitor_id === competitorId)

    const brandPerceptionReport = await getBrandPerceptionReport(brandId)
    const prioritizedBrandPerceptionReport = prioritizeBrandReport(brandPerceptionReport.data, brandData.name)
        
    return (
        <DashboardLayout brandData={brandData}>
            <DashboardInnerLayout>
                <BrandDashboard
                    title={competitorWebsiteScraps?.name}
                    extractorReport={latestCompetitorWebsiteReport?.extraction_report?.response? parseJsonFromMarkdown(latestCompetitorWebsiteReport.extraction_report.response): null}
                    synthesizerReport={latestCompetitorWebsiteReport?.synthesizer_report?.response ?? null}
                    brandPerceptionReport={prioritizedBrandPerceptionReport}
                    websiteScrapsData={competitorWebsiteScraps}
                    socialScrapsData={competitorSocialScraps}
                    socialReportsData={latestCompetitorSocialReport.reports}
                />
            </DashboardInnerLayout>
        </DashboardLayout>
    )
}