import { getBrandData } from '@/data/brands'
import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default async function BrandPage({ params }: { params: { brandId: string } }) {
  await checkAuth()
  const { brandId } = params
  const brandData: any[] = []

  const brandCompetitorData = await getBrandData(brandId)
  brandData.push({ type: 'brandCompetitor', data: brandCompetitorData })

  return (
    <DashboardLayout brandId={brandId}>
      <DashboardInnerLayout>
        <BrandDashboard data={brandData} />
      </DashboardInnerLayout>
    </DashboardLayout>
  )
}