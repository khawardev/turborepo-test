import { getCurrentUser } from "@/server/actions/authActions";
import { getpreviousWebsiteScraps, getscrapeBatchWebsite } from "@/server/actions/website/websiteScrapeActions";
import { notFound } from "next/navigation";
import WebsiteScraps from "./WebsiteScraps";

export default async function WebsiteScrapsServer({ brandName, brand_id }: { brandName: string, brand_id: string }) {
    const user = await getCurrentUser();
    if (!user) notFound();

    const previousWebsiteScraps = await getpreviousWebsiteScraps(user.client_id, brand_id);
    const websiteScrapeBatchPromises = previousWebsiteScraps.map(
        async (scrape: any) => await getscrapeBatchWebsite(brand_id, scrape.batch_id)
    );
    const websiteScrapeBatchResults = await Promise.all(websiteScrapeBatchPromises);
    const validWebsiteScrapeData = websiteScrapeBatchResults.filter(data => data);

    return (
        <WebsiteScraps
            allScrapsData={validWebsiteScrapeData}
            brandName={brandName}
            brand_id={brand_id}
        />
    );
}
