import { getBatchSocialReports } from '@/server/actions/ccba/social/socialReportActions'
import SocialReportDisplay from "@/components/stages/ccba/details/reports-tab/social/SocialReportDisplay";

export default async function SocialAuditTab({ brandId, competitorId }: { brandId: string, competitorId?: string }) {
  const socialReportsData: any = await getBatchSocialReports(brandId);
  
  let reports = null;

  if (competitorId) {
    const latestSocialReports = socialReportsData?.data?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const latestCompetitorSocialReport = latestSocialReports?.[0]?.competitor_reports?.find((report: any) => report.competitor_id === competitorId)
    reports = latestCompetitorSocialReport.reports;
  } else {
    const latestSocialReport = socialReportsData?.data?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    reports = latestSocialReport?.brand_reports;
  }

  if (reports && reports.length > 0) {
    return (
      <SocialReportDisplay
        entityReports={reports}
        selectedEntityName={reports[0]?.entity_name}
      />
    )
  }

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <p className="text-muted-foreground text-center">
        No reports are present at the moment.
      </p>
    </div>
  )
}
