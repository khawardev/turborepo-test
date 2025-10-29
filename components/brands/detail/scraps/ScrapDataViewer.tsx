'use client'

import DashboardHeader from '@/components/dashboard/shared/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebsiteScraps from './website/WebsiteScraps';
import SocialScraps from './social/SocialScraps';

export default function ScrapDataViewer({ allWebsiteScrapsData, allSocialScrapsData, brandName, brand_id }: any) {
    
    return (
        <div className="flex flex-col space-y-8">
            <DashboardHeader
                title="Brand Scraps"
                subtitle="View all website and social scraped data from Brand and Competitor"
            />

            <Tabs defaultValue="website" >
                <TabsList >
                    <TabsTrigger value="website">Website Scraps</TabsTrigger>
                    <TabsTrigger value="social-media">Social Media Scraps</TabsTrigger>
                </TabsList>
                <TabsContent value="website" className="pt-6">
                    <WebsiteScraps
                        allScrapsData={allWebsiteScrapsData}
                        brandName={brandName}
                        brand_id={brand_id}
                    />
                </TabsContent>
                <TabsContent value="social-media" className="pt-6">
                    <SocialScraps
                        allSocialScrapsData={allSocialScrapsData}
                        brandName={brandName}
                        brand_id={brand_id}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}