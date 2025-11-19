import BrandDashboard from '@/components/stages/ccba/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/static/shared/DashboardLayout'
import DashboardLayout from '@/components/stages/ccba/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import RawDataTab from '@/components/stages/ccba/dashboard/raw-data/RawDataTab'
import WebsiteAuditData from '@/components/stages/ccba/dashboard/website-audit/WebsiteAuditData'
import SocialAuditTab from '@/components/stages/ccba/dashboard/social-audit/SocialAuditTab'
import AnalyticsDashboardsData from '@/components/stages/ccba/dashboard/analytics-dashboards/AnalyticsDashboardsData'
import { getCurrentUser } from '@/server/actions/authActions'

export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  await getCurrentUser();
  
  const { brandId } = await params;
  const brandData = await getBrandbyIdWithCompetitors(brandId);

  return (
    <DashboardLayout brandData={brandData}>
      <DashboardInnerLayout>
        <BrandDashboard
          title={brandData.name}
          rawDataTab={<RawDataTab brandId={brandId} />}
          websiteAuditTab={<WebsiteAuditData brandId={brandId} title={brandData.name} />}
          socialAuditTab={<SocialAuditTab brandId={brandId} />}
          analyticsDashboardsTab={<AnalyticsDashboardsData brandId={brandId} brandName={brandData.name} />}
        />
      </DashboardInnerLayout>
    </DashboardLayout>
  )
}