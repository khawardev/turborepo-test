'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./shared/DashboardHeader";
import DashboardSkeleton from './shared/DashboardSkeleton';
import { Suspense } from "react";

export default function BrandDashboard({
    title,
    rawDataTab,
    websiteAuditTab,
    socialAuditTab,
    analyticsDashboardsTab
}: {
    title: string,
    rawDataTab: React.ReactNode,
    websiteAuditTab: React.ReactNode,
    socialAuditTab: React.ReactNode,
    analyticsDashboardsTab: React.ReactNode
}) {

    return (
        <div>
            <DashboardHeader title={title} subtitle="Website and Social Captured Data, Extracted & Outside-In reports, Brand Perception and Analytics Dashboards." />
            <Tabs defaultValue="raw_data">
                <TabsList>
                    <TabsTrigger value="raw_data">Raw Data</TabsTrigger>
                    <TabsTrigger value="website_audit">Website Audit Reports</TabsTrigger>
                    <TabsTrigger value="social_audit">Social Media Audit Reports</TabsTrigger>
                    <TabsTrigger value="analytics_dashboards">Analytics Dashboard</TabsTrigger>
                </TabsList>

                <TabsContent value="raw_data">
                    <Suspense fallback={<DashboardSkeleton />}>
                        {rawDataTab}
                    </Suspense>
                </TabsContent>

                <TabsContent value="website_audit">
                    <Suspense fallback={<DashboardSkeleton />}>
                        {websiteAuditTab}
                    </Suspense>
                </TabsContent>

                <TabsContent value="social_audit">
                    <Suspense fallback={<DashboardSkeleton />}>
                        {socialAuditTab}
                    </Suspense>
                </TabsContent>

                <TabsContent value="analytics_dashboards">
                    <Suspense fallback={<DashboardSkeleton />}>
                        {analyticsDashboardsTab}
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}