import BrandProfile from "@/components/stages/ccba/details/profile-tab/BrandProfile";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getBatchSocialReports } from "@/server/actions/ccba/social/socialReportActions";
import { getBatchWebsiteReports } from "@/server/actions/ccba/website/websiteReportActions";
import { toast } from "sonner";

export default async function BrandProfileTab({ brandId }: { brandId: string }) {
  const brandResponse = await getBrandbyIdWithCompetitors(brandId);
  if (!brandResponse.success) {
    toast.error(brandResponse.toast);
    return <div>Error loading brand data.</div>;
  }
  const brandData = brandResponse.data;

  const socialReportData = await getBatchSocialReports(brandId);

  return (
    <BrandProfile
      brand={brandData}
      isScrapped={socialReportData?.data && socialReportData?.data.length > 0}
    />
  );
}
