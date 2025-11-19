import { getBrandPerceptionReport } from '@/server/actions/ccba/agent/brandPerceptionDashboardAction'
import { getBrandSocialDashboard } from '@/server/actions/ccba/agent/brandSocialDashboardAction'
import { prioritizeBrandReport } from '@/lib/static/prioritizeBrandReport'
import AnalyticsDashboardsTabs from './AnalyticsDashboardsTabs'

export default async function AnalyticsDashboardsData({ brandId, brandName, competitorId }: { brandId: string, brandName: string, competitorId?: string }) {
  const brandPerceptionReportData = await getBrandPerceptionReport(brandId);
  const brandPerceptionReport = prioritizeBrandReport(brandPerceptionReportData.data, brandName);

  let socialAnalyticsDashboard = null;
  const socialAnalytics = await getBrandSocialDashboard(brandId)

  if (!competitorId) {
    socialAnalyticsDashboard = socialAnalytics.data.brand
  } else {
    socialAnalyticsDashboard = socialAnalytics.data.competitors.find(
      (item: any) => item.competitor_id === competitorId
    )
  }
  
  return <AnalyticsDashboardsTabs brandPerceptionReport={brandPerceptionReport} socialAnalyticsDashboard={socialAnalyticsDashboard} />
}
