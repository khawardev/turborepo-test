
import Phase2Dashboard from '@/components/brandos-v2.1/Phase2Dashboard';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { Suspense } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Phase2Page(props: {
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
          title="Phase 2: Syn & Reporting"
          subtitle="Synthesizing meaning and generating strategic reports."
        />
        <Suspense fallback={<div>Loading Phase 2...</div>}>
          <Phase2Dashboard engagementId={engagementId} />
        </Suspense>
      </>
  );
}
