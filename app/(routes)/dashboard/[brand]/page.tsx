import { getBrandData } from '@/data/brands'
import DashboardLayout from '../page'
import BrandDashboard from '@/components/dashboard/BrandDashboard'
import { redirect } from 'next/navigation'
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout'
import { getCurrentUser } from '@/server/actions/authActions'

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
    const { brand } = await params
    const user: any = await getCurrentUser();
    const brandData = await getBrandData(brand)
    if (!user) {
        redirect('/')
    }
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