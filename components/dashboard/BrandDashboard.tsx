'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./shared/DashboardHeader";
import SocialMediaDashboard from "./social-media/SocialMediaDashboard";
import EarnedMediaDashboard from "./earned-media/EarnedMediaDashboard";
import RawDataDashboard from "./raw-data/RawDataDashboard";
import { facebookData } from "@/data/ayaz_socials/facebook";
import { linkedinData } from "@/data/ayaz_socials/linkedin";
import { youtubeData } from "@/data/ayaz_socials/youtube";
import ExtractedDataDashboard from "./extracted-data/ExtractedDataDashboard";
import { extractedData } from "@/data/response/agents/2.GET_bedrock-extraction-report";
import SynthesizedReportsDashboard from "./synthesized-reports/SynthesizedReportsDashboard";
import { SynthesizedReport } from "@/data/response/agents/4.GET_bedrock-synthesizor-report";

export default function BrandDashboard({ data }: any) {
    if (!data) return null;

    const rawData = {
        socialMedia: {
            facebook: facebookData,
            linkedin: linkedinData,
            youtube: youtubeData,
        }
    };

    return (
        <div>
            <DashboardHeader title={data.brandName}
                subtitle="Raw website and social data, extracted insights, synthesized reports, and analytics dashboards."
            />

            <Tabs defaultValue="raw_data" className="mt-4">
                <TabsList>
                    <TabsTrigger value="raw_data">Raw Data</TabsTrigger>
                    <TabsTrigger value="extracted_data">Extracted Data</TabsTrigger>
                    <TabsTrigger value="synthesized_reports">Synthesized Report</TabsTrigger>
                    <TabsTrigger value="analytics_dashboards">Analytics Dashboard</TabsTrigger>
                </TabsList>

                <TabsContent value="raw_data">
                    <RawDataDashboard data={rawData} />
                </TabsContent>

                <TabsContent value="extracted_data">
                    <ExtractedDataDashboard data={extractedData} />
                </TabsContent>

                <TabsContent value="synthesized_reports">
                    <SynthesizedReportsDashboard data={SynthesizedReport} />
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