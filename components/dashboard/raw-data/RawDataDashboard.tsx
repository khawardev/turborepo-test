'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WebsiteDataView from './website/WebsiteDataView'
import SocialDataView from '@/components/brands/detail/scraps/social/SocialDataView'
import ScrapDataViewerSkeleton from '@/app/(routes)/brands/[brandId]/_components/_skeleton/ScrapDataViewerSkeleton'
import { Suspense } from 'react'
import DashboardSkeleton from '../shared/DashboardSkeleton'
export default function RawDataDashboard({ websiteScrapsData, socialScrapsData }: any) {
    return (
        <Tabs defaultValue="website">
            <TabsList>
                <TabsTrigger value="website">Website</TabsTrigger>
                <TabsTrigger value="social_media">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="website">
                <Suspense fallback={<DashboardSkeleton />}>
                    <WebsiteDataView websiteScrapsData={websiteScrapsData} />
                </Suspense>
            </TabsContent>

            <TabsContent value="social_media">
                <Suspense fallback={<ScrapDataViewerSkeleton />}>
                    <SocialDataView socialScrapedData={socialScrapsData} />
                </Suspense>
            </TabsContent>
        </Tabs>
    )
}