'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebsiteDataView from "./WebsiteDataView";
import SocialMediaDataView from "./social-media/SocialMediaDataView";
import { websiteScrapedData } from "@/data/response/scraping/4.batch-website-scrape-results";

export default function RawDataDashboard({ data }: any) {
    if (!data) return null;

    return (
        <Tabs defaultValue="website">
            <TabsList>
                <TabsTrigger value="website">Website</TabsTrigger>
                <TabsTrigger value="social_media">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="website">
                <WebsiteDataView data={websiteScrapedData} />
            </TabsContent>

            <TabsContent value="social_media">
                <SocialMediaDataView data={data.socialMedia} />
            </TabsContent>
        </Tabs>
    );
}