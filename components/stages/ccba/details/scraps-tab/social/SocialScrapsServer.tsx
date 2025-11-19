import { getPreviousSocialScrapes, getScrapeBatchSocial } from "@/server/actions/ccba/social/socialScrapeActions";
import SocialScraps from "./SocialScraps";
import { getCurrentUser } from "@/server/actions/authActions";

export default async function SocialScrapsServer({ brandName, brand_id }: { brandName: string, brand_id: string }) {
    const user = await getCurrentUser();

    const previousSocialScrapes = await getPreviousSocialScrapes(user.client_id, brand_id);
    const socialScrapeBatchPromises = previousSocialScrapes.map(
        async (scrape: any) => await getScrapeBatchSocial(brand_id, scrape.batch_id)
    );
    const socialScrapeBatchResults = await Promise.all(socialScrapeBatchPromises);
    const validSocialScrapeData = socialScrapeBatchResults.filter(data => data);

    return (
        <SocialScraps
            allSocialScrapsData={validSocialScrapeData}
            brandName={brandName}
            brand_id={brand_id}
        />
    );
}
