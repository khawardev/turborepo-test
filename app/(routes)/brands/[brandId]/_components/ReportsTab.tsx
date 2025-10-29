import ReportDataViewer from "@/components/brands/detail/reports/ReportDataViewer";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getBatchSocialReports } from "@/server/actions/social/socialReportActions";
import { getBatchWebsiteReports } from "@/server/actions/website/websiteReportActions";

export default async function ReportsTab({ brandId }: { brandId: string }) {
  const brandData = await getBrandbyIdWithCompetitors(brandId);
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
