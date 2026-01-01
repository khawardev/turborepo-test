
import Phase1Dashboard from '@/components/brandos-v2.1/Phase1Dashboard';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { Suspense } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Phase1Page(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams;
  const engagementId = typeof searchParams.engagementId === 'string' ? searchParams.engagementId : '';

  if (!engagementId) {
     return <div className="p-8">Error: No Engagement ID provided.</div>
  }

  return (
      <>
        <DashboardLayoutHeading
          title="Phase 1: Extraction & Compilation"
          subtitle="Extracting structured data and compiling bedrocks."
        />
        <Suspense fallback={<div>Loading Phase 1 Dashboard...</div>}>
          <Phase1Dashboard engagementId={engagementId} />
        </Suspense>
      </>
  );
}
