import ReportDataViewer from "@/components/stages/ccba/details/reports-tab/ReportDataViewer";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getBatchSocialReports } from "@/server/actions/ccba/social/socialReportActions";
import { getBatchWebsiteReports } from "@/server/actions/ccba/website/websiteReportActions";
import { toast } from "sonner";

export default async function ReportsTab({ brandId }: { brandId: string }) {
  const brandResponse = await getBrandbyIdWithCompetitors(brandId);
  if (!brandResponse.success || !brandResponse.data) {
    toast.error(brandResponse.toast);
    return <div>Error loading brand data.</div>;
  }
  const brandData = brandResponse.data;
  
  const websiteReportData = await getBatchWebsiteReports(brandId);
  const allSocialReportsData = await getBatchSocialReports(brandId);

  return (
    <ReportDataViewer
      competitors={brandData.competitors}
      allSocialReportsData={allSocialReportsData?.data}
      allwebsiteReportsData={websiteReportData?.data}
      brandName={brandData.name}
    />
  );
}
