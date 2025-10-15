'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebsiteDataView from "./website/WebsiteDataView";
import SocialMediaDataView from "./social-media/SocialMediaDataView";
import { facebookData } from "@/data/ayaz_socials/facebook";
import { linkedinData } from "@/data/ayaz_socials/linkedin";
import { youtubeData } from "@/data/ayaz_socials/youtube";

export default function RawDataDashboard({ scrapedData }: any) {
    
    const rawsocialMediaData = {
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
                <WebsiteDataView scrapedData={scrapedData} />
            </TabsContent>

            <TabsContent value="social_media">
                <SocialMediaDataView data={rawsocialMediaData.socialMedia} />
            </TabsContent>
        </Tabs>
    );
}