import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions'
import { getBatchWebsiteScrapeResults } from '@/server/actions/scrapeActions'

export default async function CompetitorPage({ params }: { params: { brandId: string; competitorId: string }}) {
    const { brandId, competitorId } = params
    
    await checkAuth()
    const brand = await getBrandbyIdWithCompetitors(brandId);
    const rawData = await getBatchWebsiteScrapeResults(brandId);
    const competitorDetails = brand.competitors.find((c:any) => c.competitor_id === competitorId)
    const competitorRawData = rawData.competitors.find((c:any) => c.competitor_id === competitorId)
    
    console.log(competitorRawData, `<-> rawData <->`);


    return (
        <DashboardLayout Brand={brand}>
            <DashboardInnerLayout>
                <BrandDashboard title={competitorRawData.name} competitor={competitorDetails} competitorId={competitorId} brand={brand} rawData={competitorRawData} />
            </DashboardInnerLayout>
        </DashboardLayout>
    )
}