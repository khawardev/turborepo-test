'use client'

import DashboardHeader from '@/components/dashboard/shared/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                title="Brand Scraps"
                subtitle="View all website and social scraped data from Brand and Competitor"
            />

            <Tabs defaultValue="website" >
                <TabsList >
                    <TabsTrigger value="website">Website Scraps</TabsTrigger>
                    <TabsTrigger value="social-media">Social Media Scraps</TabsTrigger>
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