'use client'

import DashboardHeader from '@/components/dashboard/shared/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCRAPED, SCRAPS } from '@/lib/constants';
import React from 'react';

export default function ScrapDataViewer({
    websiteScrapsContent,
    socialScrapsContent
}: {
    websiteScrapsContent: React.ReactNode,
    socialScrapsContent: React.ReactNode
}) {
    return (
        <div className="flex flex-col space-y-8">
            <DashboardHeader
                title={`Brand ${SCRAPS}`}
                subtitle={`View all Website and Social ${SCRAPED} data for Brand and Competitor`}
            />

            <Tabs defaultValue="website" >
                <TabsList >
                    <TabsTrigger value="website">Website {SCRAPS}</TabsTrigger>
                    <TabsTrigger disabled={!socialScrapsContent} value="social-media">Social Media {SCRAPS}</TabsTrigger>
                </TabsList>
                <TabsContent value="website" className="pt-6">
                    {websiteScrapsContent}
                </TabsContent>
                <TabsContent value="social-media" className="pt-6">
                    {socialScrapsContent}
                </TabsContent>
            </Tabs>
        </div>
    );
}