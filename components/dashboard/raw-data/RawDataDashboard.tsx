'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WebsiteDataView from './website/WebsiteDataView'
import SocialDataView from '@/components/brands/detail/scraps/social/SocialDataView'


export default function RawDataDashboard({ websiteScrapsData, socialScrapsData }: any) {
    return (
        <Tabs defaultValue="website">
            <TabsList>
                <TabsTrigger value="website">Website</TabsTrigger>
                <TabsTrigger value="social_media">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="website">
                <WebsiteDataView websiteScrapsData={websiteScrapsData} />
            </TabsContent>

            <TabsContent value="social_media">
                <SocialDataView socialScrapedData={socialScrapsData} />
            </TabsContent>
        </Tabs>
    )
}