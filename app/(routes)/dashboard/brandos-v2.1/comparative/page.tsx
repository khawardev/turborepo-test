
import ComparativeDashboard from '@/components/brandos-v2.1/ComparativeDashboard';
import { Suspense } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ComparativePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams;
  const engagementId = typeof searchParams.engagementId === 'string' ? searchParams.engagementId : '';

  if (!engagementId) {
     return <div className="p-8">Error: No Engagement ID provided.</div>
  }

  return (
      <Suspense fallback={<div>Loading Comparative Analysis...</div>}>
         <ComparativeDashboard engagementId={engagementId} />
      </Suspense>
  );
}
