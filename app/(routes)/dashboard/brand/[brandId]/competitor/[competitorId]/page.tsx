import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import RawDataTab from '@/components/dashboard/raw-data/RawDataTab'
import WebsiteAuditData from '@/components/dashboard/website-audit/WebsiteAuditData'
import SocialAuditTab from '@/components/dashboard/social-audit/SocialAuditTab'
import AnalyticsDashboardsData from '@/components/dashboard/analytics-dashboards/AnalyticsDashboardsData'

export default async function CompetitorPage({params}: {params: Promise<{ brandId: string; competitorId: string }>}) {
    const { brandId, competitorId } = await params

    await checkAuth()
    const brandData = await getBrandbyIdWithCompetitors(brandId)
    const competitor = brandData.competitors.find((c: any) => c.id === competitorId)
    const competitorName = competitor ? competitor.name : 'Competitor';

    return (
        <DashboardLayout brandData={brandData}>
            <DashboardInnerLayout>
                <BrandDashboard
                    title={competitorName}
                    rawDataTab={<RawDataTab brandId={brandId} competitorId={competitorId} />}
                    websiteAuditTab={<WebsiteAuditData brandId={brandId} competitorId={competitorId} title={competitorName} />}
                    socialAuditTab={<SocialAuditTab brandId={brandId} competitorId={competitorId} />}
                    analyticsDashboardsTab={<AnalyticsDashboardsData brandId={brandId} brandName={brandData.name} competitorId={competitorId} />}
                />
            </DashboardInnerLayout>
        </DashboardLayout>
    )
}