import BrandDashboard from '@/components/stages/ccba/dashboard/BrandDashboard'
import DashboardLayout from '@/Previous_Components/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import RawDataTab from '@/components/stages/ccba/dashboard/raw-data/RawDataTab'
import WebsiteAuditData from '@/components/stages/ccba/dashboard/website-audit/WebsiteAuditData'
import SocialAuditTab from '@/components/stages/ccba/dashboard/social-audit/SocialAuditTab'
import AnalyticsDashboardsData from '@/components/stages/ccba/dashboard/analytics-dashboards/AnalyticsDashboardsData'
import { getCurrentUser } from '@/server/actions/authActions'
import { DashboardInnerLayout } from '@/components/stages/ccba/dashboard/shared/DashboardComponents'
import { toast } from 'sonner'

export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  await getCurrentUser();
  
  const { brandId } = await params;
  const brandResponse = await getBrandbyIdWithCompetitors(brandId);

  if (!brandResponse.success || !brandResponse.data) {
    toast.error(brandResponse.toast);
    return <div>Error loading brand data.</div>;
  }
  const brandData = brandResponse.data;

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