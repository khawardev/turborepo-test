import { getpreviousWebsiteScraps, getscrapeBatchWebsite } from "@/server/actions/website/websiteScrapeActions";
import WebsiteScraps from "./WebsiteScraps";
import { getAuthUser } from "@/lib/static/getAuthUser";

export default async function WebsiteScrapsServer({ brandName, brand_id }: { brandName: string, brand_id: string }) {
    const user = await getAuthUser();
  
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
