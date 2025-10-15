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
export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  await checkAuth();
  const { brandId } = await params;
  const user = await getCurrentUser()
  const brandData = await getBrandbyIdWithCompetitors(brandId);
  const batch_id = await getBatchId(user.client_id, brandId);
  const batchWebsiteScraps = await getscrapeBatchWebsite(brandId, batch_id);
  const batchWebsiteReports = await getBatchWebsiteReports(brandId);
  const brandPerceptionReport = await getBrandPerceptionReport(brandId);
  const prioritizedReport = prioritizeBrandReport(brandPerceptionReport.data, brandData.name);

  return (
    <DashboardLayout brandData={brandData}>
      <DashboardInnerLayout>
        <BrandDashboard
          extractorReport={parseJsonFromMarkdown(batchWebsiteReports.data[0].brand_extraction.response)}
          synthesizerReport={batchWebsiteReports.data[0].brand_synthesizer.response}
          title={brandData.name}
          brandPerceptionReport={prioritizedReport}
          scrapedData={batchWebsiteScraps.brand}
        />
      </DashboardInnerLayout>
    </DashboardLayout>
  )
}