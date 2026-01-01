
import Phase2Dashboard from '@/components/brandos-v2.1/Phase2Dashboard';
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
      <Suspense fallback={<div>Loading Phase 2 Dashboard...</div>}>
         <Phase2Dashboard engagementId={engagementId} />
      </Suspense>
  );
}
