'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import PerformanceTab from "./tabs/PerformanceTab";
import AudienceTab from "./tabs/AudienceTab";
import ContentDriversTab from "./tabs/ContentDriversTab";
import SentimentAnalysisTab from "./tabs/SentimentAnalysisTab";
import MandatedDriversTab from "./tabs/MandatedDriversTab";
import StrategicInsightsTab from "./tabs/StrategicInsightsTab";

export default function SocialMediaDashboard({ data }: any) {
    
    return (
        <Tabs defaultValue="overview" className="w-full ">
            <div className="w-full overflow-x-auto">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="drivers">Content Drivers</TabsTrigger>
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                    <TabsTrigger value="mandated">Mandated Drivers</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
            </div>
            <div>
                <TabsContent value="overview"><OverviewTab data={data} /></TabsContent>
                <TabsContent value="performance"><PerformanceTab data={data} /></TabsContent>
                <TabsContent value="audience"><AudienceTab data={data} /></TabsContent>
                <TabsContent value="drivers"><ContentDriversTab data={data} /></TabsContent>
                <TabsContent value="sentiment"><SentimentAnalysisTab data={data} /></TabsContent>
                <TabsContent value="mandated"><MandatedDriversTab data={data} /></TabsContent>
                <TabsContent value="insights"><StrategicInsightsTab data={data} /></TabsContent>
            </div>
        </Tabs>
    );
}