import { getCurrentUser } from "@/server/actions/authActions";
import { getPreviousSocialScrapes, getScrapeBatchSocial } from "@/server/actions/social/socialScrapeActions";
import { notFound } from "next/navigation";
import SocialScraps from "./SocialScraps";

export default async function SocialScrapsServer({ brandName, brand_id }: { brandName: string, brand_id: string }) {
    const user = await getCurrentUser();
    if (!user) notFound();

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
