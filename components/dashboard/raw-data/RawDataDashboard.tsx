'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebsiteDataView from "./WebsiteDataView";
import SocialMediaDataView from "./social-media/SocialMediaDataView";
import { websiteScrapedData } from "@/data/response/scraping/4.batch-website-scrape-results";
import { facebookData } from "@/data/ayaz_socials/facebook";
import { linkedinData } from "@/data/ayaz_socials/linkedin";
import { youtubeData } from "@/data/ayaz_socials/youtube";

export default function RawDataDashboard() {
    const rawData = {
        socialMedia: {
            facebook: facebookData,
            linkedin: linkedinData,
            youtube: youtubeData,
        }
    };
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
                <SocialMediaDataView data={rawData.socialMedia} />
            </TabsContent>
        </Tabs>
    );
}