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
import { getBatchWebsiteReports } from '@/server/actions/website/websiteReportActions'
import { getBatchSocialReports } from '@/server/actions/social/socialReportActions'
import { getBrandPerceptionReport } from '@/server/actions/agent/brandPerceptionAction'
export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  
  await checkAuth();
  const { brandId } = await params;
  const user = await getCurrentUser()

  const brandData = await getBrandbyIdWithCompetitors(brandId);

  const website_batch_id = await getWebsiteBatchId(user.client_id, brandId);
  const websiteScrapsData = await getscrapeBatchWebsite(brandId, website_batch_id);

  const websiteReportsData = await getBatchWebsiteReports(brandId);
  const latestWebsiteReports = websiteReportsData?.data ? [...websiteReportsData.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()): []
  
  const brandPerceptionReport = await getBrandPerceptionReport(brandId);
  const latestbrandPerceptionReport = prioritizeBrandReport(brandPerceptionReport.data, brandData.name);


  const social_batch_id = await getSocialBatchId(user.client_id, brandId);
  const socialScrapsData = await getScrapeBatchSocial(brandId, social_batch_id);

  const socialReportsData: any = await getBatchSocialReports(brandId);
  const latestSocialReport = socialReportsData?.data?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  console.log(socialReportsData, `<-> latestSocialReport <->`);


  return (
    <DashboardLayout brandData={brandData}>
      <DashboardInnerLayout>
        <BrandDashboard
          title={brandData.name}
          extractorReport={latestWebsiteReports?.[0]?.brand_extraction?.response ? parseJsonFromMarkdown(latestWebsiteReports?.[0]?.brand_extraction?.response): null}
          synthesizerReport={latestWebsiteReports?.[0]?.brand_synthesizer?.response ?? null}
          brandPerceptionReport={latestbrandPerceptionReport}
          websiteScrapsData={websiteScrapsData.brand}
          socialScrapsData={socialScrapsData.brand}
          socialReportsData={latestSocialReport?.brand_reports}
        />
      </DashboardInnerLayout>
    </DashboardLayout>
  )
}