import GatherDashboard from '@/components/brandos-v2.1/GatherDashboard';

export default async function GatherPage({ searchParams }: { searchParams: Promise<{ brandId: string; startDate?: string; endDate?: string; webLimit?: string; }> }) {
    const params = await searchParams;
    
    return <GatherDashboard 
        brandId={params.brandId}
        startDate={params.startDate}
        endDate={params.endDate}
        webLimit={params.webLimit}
    />;
}
