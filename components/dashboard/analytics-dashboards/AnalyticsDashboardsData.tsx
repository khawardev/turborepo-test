import { getBrandPerceptionReport } from '@/server/actions/agent/brandPerceptionDashboardAction'
import { getBrandSocialDashboard } from '@/server/actions/agent/brandSocialDashboardAction'
import { prioritizeBrandReport } from '@/lib/prioritizeBrandReport'
import AnalyticsDashboardsTabs from './AnalyticsDashboardsTabs'

export default async function AnalyticsDashboardsData({ brandId, brandName, competitorId }: { brandId: string, brandName: string, competitorId?: string }) {
  const brandPerceptionReportData = await getBrandPerceptionReport(brandId);
  const brandPerceptionReport = prioritizeBrandReport(brandPerceptionReportData.data, brandName);

  let socialAnalyticsDashboard = null;
  if (!competitorId) {
    const socialAnalytics = await getBrandSocialDashboard(brandId);
    socialAnalyticsDashboard = socialAnalytics.data.brand
  }
  if (competitorId) {
    socialAnalyticsDashboard = await getBrandSocialDashboard(brandId);
  }
  return <AnalyticsDashboardsTabs brandPerceptionReport={brandPerceptionReport} socialAnalyticsDashboard={socialAnalyticsDashboard} />
}
