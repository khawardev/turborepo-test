import GatherDashboard from '@/components/brandos-v2.1/GatherDashboard';
import GatherBrandList from '@/components/brandos-v2.1/gather/GatherBrandList';
import { getGatherCookies } from '@/server/actions/cookieActions';
import { redirect } from 'next/navigation';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';

export default async function GatherPage({ searchParams }: { searchParams: Promise<{ brandId: string; startDate?: string; endDate?: string; webLimit?: string; triggerScrape?: string; }> }) {
    const params = await searchParams;
    
    // Auto-Resume Logic:
    // If the user lands here without params (e.g. from sidebar), we check if they have a saved session.
    // However, the user explicitly asked to "show the brandlists" first.
    // To balance this: If they have a saved session, we COULD redirect, OR we just show the list with a "Resume" banner.
    // Given the "persistence" requirement, typically that means "take me back to where I was".
    // But "show list first" contradicts "auto-redirect".
    // I will implementation a compromise: List View is the default for /gather, BUT if you have params you see dashboard.
    // I will commented out the auto-redirect for now to satisfy "show brandlists first".
    // The SetupManager handles the "new engagement" => "persistence" flow correctly.
    
    /* 
    if (!params.brandId) {
        const cookies = await getGatherCookies();
        if (cookies.brandId) {
             const queryParams = new URLSearchParams();
             queryParams.set('brandId', cookies.brandId);
             if (cookies.startDate) queryParams.set('startDate', cookies.startDate);
             if (cookies.endDate) queryParams.set('endDate', cookies.endDate);
             if (cookies.webLimit) queryParams.set('webLimit', cookies.webLimit);
             redirect(`/dashboard/brandos-v2.1/gather?${queryParams.toString()}`);
        }
    }
    */
    
    if (!params.brandId) {
        return (
            <div className="space-y-6">
                 <DashboardLayoutHeading
                    title="Select Engagement"
                    subtitle="Choose a brand to manage data gathering and analysis."
                />
                <div className="w-full max-w-5xl mx-auto px-6 pb-12">
                     <GatherBrandList />
                </div>
            </div>
        )
    }

    return <GatherDashboard 
        brandId={params.brandId}
        startDate={params.startDate}
        endDate={params.endDate}
        webLimit={params.webLimit}
        triggerScrape={params.triggerScrape === 'true'}
    />;
}
