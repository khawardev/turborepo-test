
import Phase0Dashboard from '@/components/brandos-v2.1/Phase0Dashboard';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { Suspense } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Phase0Page(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams;
  const engagementId = typeof searchParams.engagementId === 'string' ? searchParams.engagementId : '';

 
  return (
      <>
        <DashboardLayoutHeading
          title="Phase 0: Outside-In Audit"
          subtitle="Collecting evidence and establishing the corpus."
        />
        <Suspense fallback={<div>Loading Phase 0...</div>}>
          <Phase0Dashboard engagementId={"345"} />
        </Suspense>
      </>
  );
}
