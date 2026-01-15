import { getEnrichedBrands } from "@/server/actions/brandActions";
import { DashboardInnerLayout, DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { GatherBrandList } from '@/components/brandos-v2.1/gather/GatherBrandList';
import { ActiveTasksBannerWrapper } from './ActiveTasksBannerWrapper';

export default async function GatherPage() {
    const brands = await getEnrichedBrands();
 
    if (!brands || brands.length === 0) {
        return (
            <div>
                <DashboardLayoutHeading
                    title="Data Gathering"
                    subtitle="Manage data collection and view captured content for your brands."
                />
                <div className="w-full p-6 text-center text-muted-foreground">
                    No brands found. Create a new engagement in Setup to get started.
                </div>
            </div>
        );
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

