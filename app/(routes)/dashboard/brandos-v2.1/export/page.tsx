
import ExportDashboard from '@/components/brandos-v2.1/ExportDashboard';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { Suspense } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ExportPage(props: {
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
          title="Export & Handoff"
          subtitle="Package synthesis for Brand Action Model (BAM)."
        />
        <Suspense fallback={<div>Loading Export...</div>}>
          <ExportDashboard engagementId={engagementId} />
        </Suspense>
      </>
  );
}
