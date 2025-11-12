import RawDataDashboard from "./RawDataDashboard";
import { getWebsiteBatchId, getscrapeBatchWebsite } from '@/server/actions/website/websiteScrapeActions'
import { getScrapeBatchSocial, getSocialBatchId } from '@/server/actions/social/socialScrapeActions'
import { getAuthUser } from "@/lib/static/getAuthUser";

export default async function RawDataTab({ brandId, competitorId }: { brandId: string, competitorId?: string }) {
  const user = await getAuthUser();

  const website_batch_id = await getWebsiteBatchId(user.client_id, brandId);
  const websiteScrapsData = await getscrapeBatchWebsite(brandId, website_batch_id);

  const social_batch_id = await getSocialBatchId(user.client_id, brandId);
  const socialScrapsData = await getScrapeBatchSocial(brandId, social_batch_id);

  if (competitorId) {
    const competitorWebsiteScraps = websiteScrapsData.competitors.find((c: any) => c.competitor_id === competitorId);
    const competitorSocialScraps = socialScrapsData.competitors.find((c: any) => c.competitor_id === competitorId);
    return <RawDataDashboard websiteScrapsData={competitorWebsiteScraps} socialScrapsData={competitorSocialScraps} />
  }

  return <RawDataDashboard websiteScrapsData={websiteScrapsData.brand} socialScrapsData={socialScrapsData.brand} />
}
