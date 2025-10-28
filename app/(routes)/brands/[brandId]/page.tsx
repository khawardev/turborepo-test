import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getCurrentUser } from "@/server/actions/authActions";
import { notFound } from "next/navigation";
import { ContainerMd } from "@/components/shared/containers";
import { AnimatedTabs } from "@/components/brands/detail/AnimatedTabs";
import BrandProfile from "@/components/brands/detail/profile/BrandProfile";
import ScrapDataViewer from "@/components/brands/detail/scraps/ScrapDataViewer";
import ReportDataViewer from "@/components/brands/detail/reports/ReportDataViewer";
import StaticBanner from "@/components/shared/staticBanner";
import { BlurDelay3 } from "@/components/shared/Blur";
import { getpreviousWebsiteScraps, getscrapeBatchWebsite } from "@/server/actions/website/websiteScrapeActions";
import { getPreviousSocialScrapes, getScrapeBatchSocial } from "@/server/actions/social/socialScrapeActions";
import { getBatchWebsiteReports } from "@/server/actions/website/websiteReportActions";
import { getBatchSocialReports } from "@/server/actions/social/socialReportActions";

export default async function BrandDetailPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const brandData = await getBrandbyIdWithCompetitors(brandId);

  const previousWebsiteScrapes = await getpreviousWebsiteScraps(user.client_id, brandId);
  const websiteScrapeBatchPromises = previousWebsiteScrapes.map(
    async (scrape: any) => await getscrapeBatchWebsite(brandId, scrape.batch_id)
  );
  const websiteScrapeBatchResults = await Promise.all(websiteScrapeBatchPromises);
  const validWebsiteScrapeData = websiteScrapeBatchResults.filter(data => data);

  const websiteReportData = await getBatchWebsiteReports(brandId);

  const previousSocialScrapes = await getPreviousSocialScrapes(user.client_id, brandId);
  const socialScrapeBatchPromises = previousSocialScrapes.map(
    async (scrape: any) => await getScrapeBatchSocial(brandId, scrape.batch_id)
  );
  const socialScrapeBatchResults = await Promise.all(socialScrapeBatchPromises);
  const validSocialScrapeData = socialScrapeBatchResults.filter(data => data);


  const allSocialReportsData = await getBatchSocialReports(brandId)

  const tabs = [
    {
      label: "Brand Profile",
      value: "brand_profile",
      content: (
        <BrandProfile
          brand={brandData}
          isScrapped={websiteReportData?.data && websiteReportData?.data.length > 0}
        />
      ),
    },
    {
      label: "Scraps",
      value: "scraps",
      content: (
        <ScrapDataViewer
          allWebsiteScrapsData={validWebsiteScrapeData}
          allSocialScrapsData={validSocialScrapeData}
          brand_id={brandId}
          brandName={brandData.name}
        />
      ),
    },
    {
      label: "Reports",
      value: "reports",
      content: (
        <ReportDataViewer
          competitors={brandData.competitors}
          allSocialReportsData={allSocialReportsData?.data}
          allwebsiteReportsData={websiteReportData?.data}
          brandName={brandData.name}
        />
      ),
    },
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