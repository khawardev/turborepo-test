import BrandProfile from "@/components/brands/detail/profile/BrandProfile";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getBatchWebsiteReports } from "@/server/actions/website/websiteReportActions";

export default async function BrandProfileTab({ brandId }: { brandId: string }) {
  const brandData = await getBrandbyIdWithCompetitors(brandId);
  const websiteReportData = await getBatchWebsiteReports(brandId);

  return (
    <BrandProfile
      brand={brandData}
      isScrapped={websiteReportData?.data && websiteReportData?.data.length > 0}
    />
  );
}
