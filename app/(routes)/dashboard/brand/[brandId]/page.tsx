import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors, getClientDetails } from '@/server/actions/brandActions'
import { getscrapeBatchWebsite } from '@/server/actions/scrapeActions'
import { getBatchWebsiteReports } from '@/server/actions/reportsActions'
import { parseJsonFromMarkdown } from '@/lib/jsonParser'

export default async function BrandPage({ params }: any) {

  await checkAuth()
  const { brandId } = await params
  const brandData = await getBrandbyIdWithCompetitors(brandId);
  const batchWebsiteScraps = await getscrapeBatchWebsite(brandId);
  const batchWebsiteReports = await getBatchWebsiteReports(brandId);

  return (
    <DashboardLayout brandData={brandData}>
      <DashboardInnerLayout>
        <BrandDashboard
          extractorReport={parseJsonFromMarkdown(batchWebsiteReports.data[0].brand_extraction.response)}
          synthesizerReport={batchWebsiteReports.data[0].brand_synthesizer.response}
          title={brandData.name}
          scrapedData={batchWebsiteScraps.brand}
        />
      </DashboardInnerLayout>
    </DashboardLayout>
  )
}