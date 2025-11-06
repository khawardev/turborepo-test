import BrandProfile from "@/components/stages/ccba/details/profile-tab/BrandProfile";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getBatchSocialReports } from "@/server/actions/social/socialReportActions";
import { getBatchWebsiteReports } from "@/server/actions/website/websiteReportActions";

export default async function BrandProfileTab({ brandId }: { brandId: string }) {
  const brandData = await getBrandbyIdWithCompetitors(brandId);
  const socialReportData = await getBatchSocialReports(brandId);

  return (
    <BrandProfile
      brand={brandData}
      isScrapped={socialReportData?.data && socialReportData?.data.length > 0}
    />
  );
}
