'use client'

import DashboardHeader from '@/components/dashboard/shared/DashboardHeader';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCRAPED, SCRAPS } from '@/lib/constants';
import React, { useState } from 'react';

export default function ScrapDataViewer({
    websiteScrapsContent,
    socialScrapsContent
}: {
    websiteScrapsContent: React.ReactNode,
    socialScrapsContent: React.ReactNode
}) {
    const [activeTab, setActiveTab] = useState("website")

    return (
        <div className="flex flex-col space-y-8">
            <section className=' flex items-center justify-between w-full'>
                <DashboardHeader
                    title={`Brand ${SCRAPS}`}
                    subtitle={`View all Website and Social ${SCRAPED} data for Brand and Competitor`}
                />
            </section>
            <Tabs defaultValue="website" onValueChange={setActiveTab} >
                <div className='flex items-center justify-between'>
                    <TabsList >
                        <TabsTrigger value="website">Website {SCRAPS}</TabsTrigger>
                        <TabsTrigger disabled={!socialScrapsContent} value="social-media">Social Media {SCRAPS}</TabsTrigger>
                    </TabsList>
                    {/* <div className=' flex items-center gap-2'>
                        {activeTab === "website" ? (
                            <>
                                <Status status="available" variant="secondary">
                                    <StatusIndicator />
                                    Website Data Capture
                                </Status>
                                <Status status="not-available" variant="secondary">
                                    <StatusIndicator />
                                    Website Reports
                                </Status>
                            </>
                        ) : (
                            <>
                                <Status status="pending" variant="secondary">
                                    <StatusIndicator />
                                    Social Data Capture
                                </Status>
                                <Status status="not-available" variant="secondary">
                                    <StatusIndicator />
                                    Social Reports
                                </Status>
                            </>
                        )}
                    </div> */}
                </div>
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