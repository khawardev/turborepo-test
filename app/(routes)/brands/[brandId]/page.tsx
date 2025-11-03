import { getBrandbyIdWithCompetitors } from '@/server/actions/brandActions';
import { getCurrentUser } from '@/server/actions/authActions';
import { notFound } from 'next/navigation';
import { ContainerMd } from '@/components/shared/containers';
import { AnimatedTabs } from '@/components/brands/detail/AnimatedTabs';
import StaticBanner from '@/components/shared/staticBanner';
import { BlurDelay3 } from '@/components/shared/MagicBlur';
import { Suspense } from 'react';
import BrandProfileTab from './_components/BrandProfileTab';
import ScrapsTab from './_components/ScrapsTab';
import ReportsTab from './_components/ReportsTab';
import { BrandProfileSkeleton } from './_components/_skeleton/BrandProfileSkeleton';
import ScrapDataViewerSkeleton from './_components/_skeleton/ScrapDataViewerSkeleton';
import { ReportDataViewerSkeleton } from './_components/_skeleton/ReportDataViewerSkeleton';
import { SCRAPS } from '@/lib/constants';
import { getBatchSocialReports } from '@/server/actions/social/socialReportActions';

export default async function BrandDetailPage({
  params
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const brandData = await getBrandbyIdWithCompetitors(brandId);
  const socialReportData = await getBatchSocialReports(brandId);

  const tabs = [
    {
      label: 'Brand Profile',
      value: 'brand_profile',
      tooltip: 'View Brand & Competitors profile details',
      content: (
        <Suspense fallback={<BrandProfileSkeleton />}>
          <BrandProfileTab brandId={brandId} />
        </Suspense>
      )
    },
    {
      label: SCRAPS,
      value: 'scraps',
      tooltip: 'View Brand & Competitors Captured Data details',
      content: (
        <Suspense fallback={<ScrapDataViewerSkeleton />}>
          <ScrapsTab brandId={brandId} />
        </Suspense>
      )
    },
    {
      label: 'Reports',
      value: 'reports',
      disabled: !(socialReportData?.data && socialReportData?.data.length > 0),
      disabledTooltip: 'Please Generate Reports for Website and Socials',
      tooltip: 'View Brand & Competitors Reports details',
      content: (
        <Suspense fallback={<ReportDataViewerSkeleton />}>
          <ReportsTab brandId={brandId} />
        </Suspense>
      )
    }
  ];

  return (
    <ContainerMd>
      <StaticBanner title={`${brandData.name} Brand Details`} badge="Brand Page" />
      <BlurDelay3>
        <AnimatedTabs tabs={tabs} />
      </BlurDelay3>
    </ContainerMd>
  );
}