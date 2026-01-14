import { getCurrentUser } from "@/server/actions/authActions";
import { getBrands } from "@/server/actions/brandActions";
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { GatherBrandList } from '@/components/brandos-v2.1/gather/GatherBrandList';
import { ActiveTasksBannerWrapper } from './ActiveTasksBannerWrapper';
import { Suspense } from "react";

export default async function GatherPage() {
    await getCurrentUser();
    const brands = await getBrands();
 
    if (!brands) {
        return null;
    }

    return (
        <div>
            <DashboardLayoutHeading
                title="Data Gathering"
                subtitle="Manage data collection and view captured content for your brands."
            />
            <div className="w-full">
                <ActiveTasksBannerWrapper brands={brands} />
                <GatherBrandList brands={brands} />
            </div>
        </div>
    );
}
