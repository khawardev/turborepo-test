'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Loader2, Database, Activity, Link as LinkIcon, Globe } from 'lucide-react';
import { EmptyStateCard } from '@/components/shared/CardsUI';

type GatherBrand = {
    brand: any;
    hasData: boolean;
    isProcessing: boolean;
    websiteBatchId: string | null;
    socialBatchId: string | null;
};

type GatherBrandListProps = {
    brandsData: GatherBrand[];
};

export function GatherBrandList({ brandsData }: GatherBrandListProps) {
    if (!brandsData || brandsData.length === 0) {
        return (
            <EmptyStateCard message="No brands found. Create a new engagement in Setup to get started." />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">Your Brands</h3>
                <Badge variant="outline" className="text-muted-foreground">
                    {brandsData.length} brand{brandsData.length !== 1 ? 's' : ''}
                </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {brandsData.map((item, index) => (
                    <GatherBrandCard key={item.brand.brand_id} item={item} index={index} />
                ))}
            </div>
        </div>
    );
}

function GatherBrandCard({ item, index }: { item: GatherBrand; index: number }) {
    const { brand, hasData, isProcessing } = item;

    const getHref = () => {
        if (isProcessing) {
            return `/dashboard/brandos-v2.1/gather/collecting/${brand.brand_id}`;
        }
        if (hasData) {
            return `/dashboard/brandos-v2.1/gather/data/${brand.brand_id}`;
        }
        return `/dashboard/brandos-v2.1/gather/collecting/${brand.brand_id}`;
    };

    const getStatusBadge = () => {
        if (isProcessing) {
            return (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing
                </Badge>
            );
        }
        if (hasData) {
            return (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Data Available
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-muted-foreground flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                No Data
            </Badge>
        );
    };

    return (
        <Link href={getHref()}>
            <Card className="cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/50 group relative h-full">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base font-medium line-clamp-1">
                            {brand.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs truncate">
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="truncate">{brand.url ? new URL(brand.url).hostname : 'No URL'}</span>
                        </CardDescription>
                    </div>
                    <div className="shrink-0">{getStatusBadge()}</div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-normal">
                            {brand.competitors?.length || 0} Competitor{brand.competitors?.length !== 1 ? 's' : ''}
                        </Badge>

                        {brand.linkedin_url && (
                            <Badge variant="secondary" className="text-[10px] font-normal">LinkedIn</Badge>
                        )}
                        {brand.facebook_url && (
                            <Badge variant="secondary" className="text-[10px] font-normal">Facebook</Badge>
                        )}
                        {brand.youtube_url && (
                            <Badge variant="secondary" className="text-[10px] font-normal">YouTube</Badge>
                        )}
                    </div>
                </CardContent>
                <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-primary" />
                </span>
            </Card>
        </Link>
    );
}
