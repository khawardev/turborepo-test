'use client'

import DashboardHeader from '@/components/stages/ccba/dashboard/shared/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WebsiteReports from './website/WebsiteReports'
import SocialMediaReports from './social/SocialReports'

export default function ReportDataViewer({ allwebsiteReportsData, allSocialReportsData, brandName, competitors }: any) {
    return (
        <div className="flex flex-col space-y-4">
            <DashboardHeader
                title="Brand Reports"
                subtitle="View all generated reports and competitor insights"
            />
            <Tabs defaultValue="website" className="w-full">
                <TabsList>
                    <TabsTrigger value="website">Website Reports</TabsTrigger>
                    <TabsTrigger value="social-media">Social Media Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="website" className="pt-6">
                    <WebsiteReports
                        allReportsData={allwebsiteReportsData}
                        brandName={brandName}
                        competitors={competitors}
                    />
                </TabsContent>
                <TabsContent value="social-media" className="pt-6">
                    <SocialMediaReports
                        allReportsData={allSocialReportsData}
                        brandName={brandName}
                        competitors={competitors}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}