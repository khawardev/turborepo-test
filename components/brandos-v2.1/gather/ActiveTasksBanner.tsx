'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProcessingBrand = {
    brand: any;
    hasData: boolean;
    isProcessing: boolean;
    websiteBatchId: string | null;
    socialBatchId: string | null;
};

type ActiveTasksBannerProps = {
    processingBrands: ProcessingBrand[];
};

export function ActiveTasksBanner({ processingBrands }: ActiveTasksBannerProps) {
    if (processingBrands.length === 0) return null;

    return (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10">
            <CardHeader className="pb-3">
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
                <div className="flex flex-wrap gap-3">
                    {processingBrands.map((item) => (
                        <Link
                            key={item.brand.brand_id}
                            href={`/dashboard/brandos-v2.1/gather/collecting/${item.brand.brand_id}`}
                        >
                            <Badge
                                variant="secondary"
                                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 cursor-pointer flex items-center gap-2"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {item.brand.name}
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Badge>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
