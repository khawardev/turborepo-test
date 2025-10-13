'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./shared/DashboardHeader";
import RawDataDashboard from "./raw-data/RawDataDashboard";
import ExtractedDataDashboard from "./extracted-data/ExtractedDataDashboard";
import SynthesizedReportsDashboard from "./synthesized-reports/SynthesizedReportsDashboard";
import { SynthesizedReport } from "@/data/response/agents/4.GET_bedrock-synthesizor-report";
import BrandPerceptionDashboard from "./brand-perception/BrandPerceptionDashboard";
import EarnedMediaDashboard from "./earned-media/EarnedMediaDashboard";
import { getBrandData } from "@/data/brands";
import { magnaData } from "@/data/brands/magna";
import SocialMediaDashboard from "./social-media/SocialMediaDashboard";

export default function BrandDashboard({ scrapedData, title, extractorReport, synthesizerReport, brandPerceptionReport }: any) {
    return (
        <div>
            <DashboardHeader title={title} subtitle="Raw website and social data, extracted insights, Outside-In reports, Brand Perception and analytics dashboards." />
            <Tabs defaultValue="raw_data">
                <TabsList>
                    <TabsTrigger value="raw_data">Raw Data</TabsTrigger>
                    <TabsTrigger value="website_audit">Website Audit Reports</TabsTrigger>
                    <TabsTrigger value="social_audit">Social Media Audit Reports</TabsTrigger>
                    <TabsTrigger value="analytics_dashboards">Analytics Dashboard</TabsTrigger>
                </TabsList>

                <TabsContent value="raw_data">
                    <RawDataDashboard scrapedData={scrapedData} />
                </TabsContent>

                <TabsContent value="website_audit">
                    <Tabs defaultValue="extracted_data">
                        <TabsList>
                            <TabsTrigger value="extracted_data">Extracted Data</TabsTrigger>
                            <TabsTrigger value="synthesized_reports">Synthesized Report</TabsTrigger>
                        </TabsList>

                        <TabsContent value="extracted_data">
                            <ExtractedDataDashboard extractorReport={extractorReport} title={title} />
                        </TabsContent>

                        <TabsContent value="synthesized_reports">
                            <SynthesizedReportsDashboard synthesizerReport={synthesizerReport} title={title} />
                        </TabsContent>
                    </Tabs>
                </TabsContent>


                <TabsContent value="social_audit">
                    <Tabs defaultValue="facebook">
                        <TabsList>
                            <TabsTrigger value="facebook">Facebook</TabsTrigger>
                            <TabsTrigger value="instagram">Instagram</TabsTrigger>
                            <TabsTrigger value="x_twitter">X (Twitter)</TabsTrigger>
                            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                            <TabsTrigger value="youtube">YouTube</TabsTrigger>
                            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                        </TabsList>

                        <TabsContent value="facebook">
                            <SynthesizedReportsDashboard data={SynthesizedReport} />
                        </TabsContent>

                        <TabsContent value="instagram">
                            <SynthesizedReportsDashboard data={SynthesizedReport} />
                        </TabsContent>

                        <TabsContent value="x_twitter">
                            <SynthesizedReportsDashboard data={SynthesizedReport} />
                        </TabsContent>

                        <TabsContent value="linkedin">
                            <SynthesizedReportsDashboard data={SynthesizedReport} />
                        </TabsContent>

                        <TabsContent value="youtube">
                            <SynthesizedReportsDashboard data={SynthesizedReport} />
                        </TabsContent>

                        <TabsContent value="tiktok">
                            <SynthesizedReportsDashboard data={SynthesizedReport} />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="analytics_dashboards">
                    <Tabs defaultValue="social_media">
                        <TabsList>
                            <TabsTrigger value="social_media">Social Media</TabsTrigger>
                            {/* <TabsTrigger value="earned_media">Earned Media</TabsTrigger> */}
                            <TabsTrigger value="brand_perception">Brand Perception Audit</TabsTrigger>
                        </TabsList>

                     <TabsContent value="social_media">
                            <SocialMediaDashboard data={magnaData.socialMedia} />
                        </TabsContent> 

                        {/* <TabsContent value="earned_media">
                            <EarnedMediaDashboard data={magnaData.earnedMedia} />
                        </TabsContent> */}

                        <TabsContent value="brand_perception">
                            <BrandPerceptionDashboard brandPerceptionReport={brandPerceptionReport} />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>
        </div>
    );
}