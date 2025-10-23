'use client'

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ButtonSpinner } from '@/components/shared/spinner';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { timeAgo } from '@/lib/date-utils';
import { WebsiteReportButton } from '../../reports/website/WebsiteReportButton';
import WebsiteDataView from '@/components/dashboard/raw-data/website/WebsiteDataView';
import { scrapeBatchWebsite } from '@/server/actions/website/websiteScrapeActions';
import { WebsiteAskLimitToast } from './WebsiteAskLimitToast';
import { SocialReportButton } from '../../reports/social/SocialReportButton';

export default function WebsiteScraps({ allScrapsData, brandName, brand_id }: any) {
    const [isScrapingPending, startScrapingTransition] = useTransition();
    const [isDataTransitioning, startDataTransition] = useTransition();
    const router = useRouter();
    const [selectedScrapBatchId, setSelectedScrapBatchId] = useState<string | null>(null);
    const [selectedSourceName, setSelectedSourceName] = useState<string>(brandName);

    const sortedScraps = useMemo(() => {
        if (!allScrapsData || allScrapsData.length === 0) return [];
        return [...allScrapsData].sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
    }, [allScrapsData]);

    useEffect(() => {
        if (sortedScraps.length > 0) {
            const latestScrap = sortedScraps[0];
            if (latestScrap.batch_id !== selectedScrapBatchId) {
                setSelectedScrapBatchId(latestScrap.batch_id);
                setSelectedSourceName(brandName);
            }
        }
    }, [sortedScraps, brandName, selectedScrapBatchId]);

    const selectedScrap = useMemo(() => {
        if (!selectedScrapBatchId) return null;
        return sortedScraps.find((scrap: any) => scrap.batch_id === selectedScrapBatchId);
    }, [selectedScrapBatchId, sortedScraps]);

    const dataSources = useMemo(() => {
        if (!selectedScrap) return [];
        const sources = [{ name: brandName, data: selectedScrap.brand }];
        if (selectedScrap.competitors) {
            selectedScrap.competitors.forEach((comp: any) => {
                sources.push({ name: comp.name, data: comp });
            });
        }
        return sources;
    }, [selectedScrap, brandName]);

    const selectedDataSource = useMemo(() => {
        if (!selectedSourceName || dataSources.length === 0) return null;
        return dataSources.find(source => source.name === selectedSourceName)?.data ?? null;
    }, [selectedSourceName, dataSources]);

    const handleScrapSelection = (batchId: string) => {
        startDataTransition(() => {
            setSelectedScrapBatchId(batchId);
            setSelectedSourceName(brandName);
        });
    };

    const handleSourceSelection = (name: string) => {
        startDataTransition(() => {
            setSelectedSourceName(name);
        });
    };

    if (sortedScraps.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground h-[60vh] flex items-center justify-center">
                No website scrap data available.
            </div>
        );
    }

    const askLimit = () => {
        toast.custom((t: any) => (
            <WebsiteAskLimitToast
                t={t}
                onConfirm={(parsedLimit) => {
                    scrapeBrand(parsedLimit)
                }}
            />
        ))
    }

    const scrapeBrand = async (limit: number) => {
        startScrapingTransition(async () => {
            const result = await scrapeBatchWebsite(brand_id, limit)
            if (result?.success) {
                router.refresh()
                toast.success("Scraping completed successfully 🎉")
            } else {
                toast.error("Scraping failed.")
            }
        })
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div className='flex items-center gap-2'>
                    <TooltipProvider>
                        {dataSources.map((source, index) => (
                            <React.Fragment key={source.name}>
                                {index === 1 && (
                                    <div className="h-6 w-px bg-border" aria-hidden="true" />
                                )}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className='capitalize'
                                            variant={selectedSourceName === source.name ? "outline" : "ghost"}
                                            onClick={() => handleSourceSelection(source.name)}
                                        >
                                            {source.name}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{index === 0 ? "Select Brand Website data" : "Select Competitor Website data"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </React.Fragment>
                        ))}
                    </TooltipProvider>
                </div>

                <div className='flex items-center gap-2'>
                    <Button disabled={isScrapingPending} onClick={askLimit}>
                        {isScrapingPending ? (
                            <ButtonSpinner>Scraping</ButtonSpinner>
                        ) : (
                            "Scrape Website"
                        )}
                    </Button>
                    <WebsiteReportButton brand_id={brand_id} batch_id={selectedScrapBatchId ? selectedScrapBatchId : sortedScraps[0].batch_id} />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="inline-block">
                                    <Select onValueChange={handleScrapSelection} value={selectedScrapBatchId ?? ''}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Select a scrap run" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortedScraps.map((scrap: any) => (
                                                <SelectItem key={scrap.batch_id} value={scrap.batch_id}>
                                                    {timeAgo(scrap.scraped_at)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Select previous Website Scraps
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <WebsiteDataView scrapedData={selectedDataSource} />
        </div>
    );
}