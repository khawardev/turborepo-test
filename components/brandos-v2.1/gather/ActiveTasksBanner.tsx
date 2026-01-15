'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Loader2, Globe, Users } from 'lucide-react';
import { getBatchWebsiteScrapeStatus } from '@/server/actions/ccba/website/websiteStatusAction';
import { getBatchSocialScrapeStatus } from '@/server/actions/ccba/social/socialStatusAction';

type ProcessingBrand = {
    brand: any;
    hasData: boolean;
    isProcessing: boolean;
    websiteBatchId: string | null;
    socialBatchId: string | null;
    webStatus: string | null;
    socialStatus: string | null;
};

type ActiveTasksBannerProps = {
    initialProcessingBrands: ProcessingBrand[];
};

function isStatusProcessing(status: string | null): boolean {
    if (!status) return false;
    const completedStatuses = ['Completed', 'CompletedWithErrors', 'Failed'];
    return !completedStatuses.includes(status);
}

export function ActiveTasksBanner({ initialProcessingBrands }: ActiveTasksBannerProps) {
    const router = useRouter();
    const [processingBrands, setProcessingBrands] = useState<ProcessingBrand[]>(initialProcessingBrands);
    const [isPolling, setIsPolling] = useState(initialProcessingBrands.length > 0);

    const checkStatuses = useCallback(async () => {
        if (processingBrands.length === 0) return [];

        const updatedBrands = await Promise.all(
            processingBrands.map(async (item) => {
                let webStatus = item.webStatus;
                let socialStatus = item.socialStatus;

                try {
                    if (item.websiteBatchId && isStatusProcessing(item.webStatus)) {
                        const webRes = await getBatchWebsiteScrapeStatus(item.brand.brand_id, item.websiteBatchId);
                        if (webRes?.status) webStatus = webRes.status;
                    }
                    if (item.socialBatchId && isStatusProcessing(item.socialStatus)) {
                        const socialRes = await getBatchSocialScrapeStatus(item.brand.brand_id, item.socialBatchId);
                        if (socialRes?.status) socialStatus = socialRes.status;
                    }
                } catch (e) {
                    console.error('[ActiveTasksBanner] Status check error:', e);
                }

                return {
                    ...item,
                    webStatus,
                    socialStatus
                };
            })
        );

        return updatedBrands;
    }, [processingBrands]);

    useEffect(() => {
        if (!isPolling || processingBrands.length === 0) return;

        const interval = setInterval(async () => {
            try {
                const updatedBrands = await checkStatuses();

                const stillProcessing = updatedBrands.filter(
                    (b) => isStatusProcessing(b.webStatus) || isStatusProcessing(b.socialStatus)
                );

                setProcessingBrands(stillProcessing);

                if (stillProcessing.length === 0) {
                    setIsPolling(false);
                    clearInterval(interval);
                    router.refresh();
                }
            } catch (e) {
                console.error('[ActiveTasksBanner] Polling error:', e);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [isPolling, processingBrands.length, checkStatuses, router]);

    if (processingBrands.length === 0) return null;

    return (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10 md:m-10 m-6">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                        Active Data Collection
                    </CardTitle>
                </div>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                    The following brands are currently being processed
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {processingBrands.map((item) => {
                        const isWebProcessing = isStatusProcessing(item.webStatus);
                        const isSocialProcessing = isStatusProcessing(item.socialStatus);

                        return (
                            <div key={item.brand.brand_id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-blue-100/50 dark:bg-blue-900/20">
                                <Link
                                    href={`/dashboard/brandos-v2.1/gather/collecting/${item.brand.brand_id}`}
                                    className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300 hover:underline"
                                >
                                    {item.brand.name} Collection 
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                                <div className="flex items-center gap-2">
                                    {isWebProcessing && (
                                        <Badge variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 flex items-center gap-1.5">
                                            Website
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        </Badge>
                                    )}
                                    {isSocialProcessing && (
                                        <Badge variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 flex items-center gap-1.5">
                                            Social
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        </Badge>
                                    )}
                                    {!isWebProcessing && !isSocialProcessing && (
                                        <Badge variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 flex items-center gap-1.5">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Processing
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
