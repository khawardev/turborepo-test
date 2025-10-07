import { getBrandData } from '@/data/brands'
import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default async function CompetitorPage({ params }: { params: { competitorId: string } }) {
    await checkAuth()
    const { competitorId } = params
    const brandData = await getBrandData(competitorId)
    if (!brandData) return <div>Competitor not found</div>

    return (
        <DashboardLayout>
            <DashboardInnerLayout>
                <BrandDashboard data={brandData} />
            </DashboardInnerLayout>
        </DashboardLayout>
    )
}