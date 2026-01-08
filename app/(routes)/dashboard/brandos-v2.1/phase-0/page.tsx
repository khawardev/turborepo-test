
import Phase0Dashboard from '@/components/brandos-v2.1/Phase0Dashboard';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';
import { Suspense } from 'react';

export default function Phase0Page() {

 
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
