'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./shared/DashboardHeader";
import RawDataDashboard from "./raw-data/RawDataDashboard";
import ExtractedDataDashboard from "./extracted-data/ExtractedDataDashboard";
import SynthesizedReportsDashboard from "./synthesized-reports/SynthesizedReportsDashboard";
import BrandPerceptionDashboard from "./brand-perception/BrandPerceptionDashboard";
import { magnaData } from "@/data/brands/magna";
import SocialMediaDashboard from "./social-media/SocialMediaDashboard";
import SocialReportDisplay from "../brands/detail/reports/social/SocialReportDisplay";
import { BRAND_SOCIAL_DASHBOARD } from "@/data/BRAND_SOCIAL_DASHBOARD";
// import { BRAND_SOCIAL_DASHBOARD } from "@/data/BRAND_SOCIAL_DASHBOARD";

export default function BrandDashboard({ websiteScrapsData, title, extractorReport, synthesizerReport, brandPerceptionReport, socialScrapsData, socialReportsData }: any) {
    
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
                    <RawDataDashboard websiteScrapsData={websiteScrapsData} socialScrapsData={socialScrapsData} />
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
                    <SocialReportDisplay entityReports={socialReportsData} selectedEntityName={socialReportsData[0]?.entity_name} />
                </TabsContent>

                <TabsContent value="analytics_dashboards">
                    <Tabs defaultValue="social_media">
                        <TabsList>
                            <TabsTrigger value="social_media">Social Media</TabsTrigger>
                            {/* <TabsTrigger value="earned_media">Earned Media</TabsTrigger> */}
                            <TabsTrigger value="brand_perception">Brand Perception Audit</TabsTrigger>
                        </TabsList>

                        <TabsContent value="social_media" className=" space-y-14">
                            <SocialMediaDashboard data={magnaData.socialMedia} />
                            <SocialMediaDashboard data={BRAND_SOCIAL_DASHBOARD[0].brand.socialMedia} />
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