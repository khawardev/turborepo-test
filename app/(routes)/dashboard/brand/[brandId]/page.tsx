import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import { getBatchWebsiteScrapeResults } from '@/server/actions/scrapeActions'

export default async function BrandPage({ params }: any) {

  await checkAuth()
  const { brandId } = await params
  const brand = await getBrandbyIdWithCompetitors(brandId);
  const rawData = await getBatchWebsiteScrapeResults(brandId);
  const brandTitle = brand.name
  console.log(rawData, `<-> rawData <->`);
  
  return (
    <DashboardLayout Brand={brand}>
      <DashboardInnerLayout>
        <BrandDashboard title={brandTitle} brand={brand} rawData={rawData.brand} />
      </DashboardInnerLayout>
    </DashboardLayout>
  )
}