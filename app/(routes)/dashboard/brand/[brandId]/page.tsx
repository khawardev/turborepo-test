import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import RawDataTab from '@/components/dashboard/raw-data/RawDataTab'
import WebsiteAuditData from '@/components/dashboard/website-audit/WebsiteAuditData'
import SocialAuditTab from '@/components/dashboard/social-audit/SocialAuditTab'
import AnalyticsDashboardsData from '@/components/dashboard/analytics-dashboards/AnalyticsDashboardsData'

export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  
  await checkAuth();
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