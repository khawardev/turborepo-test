import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getCurrentUser } from "@/server/actions/authActions";
import { getpreviousScraps, getscrapeBatchWebsite, getBatchId } from "@/server/actions/scrapeActions";
import { notFound } from "next/navigation";
import { ContainerMd } from "@/components/shared/containers";
import { AnimatedTabs } from "@/components/brands/detail/AnimatedTabs";
import BrandProfile from "@/components/brands/detail/profile/BrandProfile";
import ScrapDataViewer from "@/components/brands/detail/scraps/ScrapDataViewer";
import { getBatchWebsiteReports } from "@/server/actions/reportsActions";
import ReportDataViewer from "@/components/brands/detail/reports/ReportDataViewer";

export default async function BrandDetailPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const brand = await getBrandbyIdWithCompetitors(brandId);
  const batch_id = await getBatchId(user.client_id, brandId);

  const previousScraps = await getpreviousScraps(user.client_id, brandId);
  const allScrapsDataPromises = previousScraps.map((scrap: any) =>
    getscrapeBatchWebsite(brandId, scrap.batch_id)
  );
  const allScrapsDataResults = await Promise.all(allScrapsDataPromises);
  const validScraps = allScrapsDataResults.filter(data => data !== null && data !== undefined);

  const batchWebsiteReportsResult = await getBatchWebsiteReports(brandId);
  const allReportsData = batchWebsiteReportsResult?.data || [];

  const tabs = [
    { label: "Brand Profile", value: "brand_profile", content: <BrandProfile brand={brand} isScrapped={allReportsData && allReportsData.length > 0} /> },
    { label: "Scraps", value: "scraps", content: <ScrapDataViewer allScrapsData={validScraps} brand_id={brandId} brandName={brand.name} /> },
    { label: "Reports", value: "reports", content: <ReportDataViewer competitors={brand.competitors} allReportsData={allReportsData} brandName={brand.name} /> },
  ];

  return (
    <ContainerMd>
      <AnimatedTabs tabs={tabs} />
    </ContainerMd>
  );
}