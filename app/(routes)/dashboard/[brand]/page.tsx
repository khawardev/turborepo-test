import { getBrandData } from '@/data/brands'
import DashboardLayout from '../page'
import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { checkAuth } from '@/lib/checkAuth'

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
    await checkAuth();
    const { brand } = await params
    const brandData = await getBrandData(brand)
    if (!brandData) {
        return <div>Brand not found</div>
    }

    return (
        <DashboardLayout>
            <DashboardInnerLayout>
                <BrandDashboard data={brandData} />
            </DashboardInnerLayout>
        </DashboardLayout>

    )
}