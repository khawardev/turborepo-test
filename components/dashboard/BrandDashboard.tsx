'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./shared/DashboardHeader";
import SocialMediaDashboard from "./social-media/SocialMediaDashboard";
import EarnedMediaDashboard from "./earned-media/EarnedMediaDashboard";

export default function BrandDashboard({ data }: any) {
    if (!data) return null;

    return (
        <div>
            <DashboardHeader title={data.brandName}
                subtitle="Raw website and social data, extracted insights, synthesized reports, and analytics dashboards."
            />

                <Tabs defaultValue="raw_data">
                    <TabsList>
                        <TabsTrigger value="raw_data">Raw Data</TabsTrigger>
                        <TabsTrigger value="extracted_data">Extracted Data</TabsTrigger>
                        <TabsTrigger value="synthesized_reports">Synthesized Reports</TabsTrigger>
                        <TabsTrigger value="analytics_dashboards">Analytics Dashboards</TabsTrigger>
                    </TabsList>

                    <TabsContent value="raw_data">
                        <div >Raw Data View (Website, Social, etc.)</div>
                    </TabsContent>

                    <TabsContent value="extracted_data">
                        <div >Extracted Data View (Processed Information)</div>
                    </TabsContent>

                    <TabsContent value="synthesized_reports">
                        <div >Synthesized Reports Section (Summarized Insights)</div>
                    </TabsContent>

                    <TabsContent value="analytics_dashboards">
                            <Tabs defaultValue="social_media">
                                <TabsList>
                                    <TabsTrigger value="social_media">Social Media</TabsTrigger>
                                    <TabsTrigger value="earned_media">Earned Media</TabsTrigger>
                                </TabsList>

                                <TabsContent value="social_media">
                                    <SocialMediaDashboard data={data.socialMedia} />
                                </TabsContent>

                                <TabsContent value="earned_media">
                                    <EarnedMediaDashboard data={data.earnedMedia} />
                                </TabsContent>
                            </Tabs>
                    </TabsContent>
                </Tabs>
        </div>
    );
}