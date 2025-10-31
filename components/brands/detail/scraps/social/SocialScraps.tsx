'use client'

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { timeAgo } from '@/lib/date-utils';
import SocialDataView from './SocialDataView';
import { DateRangeDisplay } from '@/components/shared/DateRangeDisplay';
import { ScrapeReportActionButtons } from '@/components/brands/detail/scraps/ScrapeReportActionButtons';
import { SCRAPE } from '@/lib/constants';


export default function SocialScraps({ allSocialScrapsData, brandName, brand_id }: any) {
    const [isDataTransitioning, startDataTransition] = useTransition();
    const [selectedScrapBatchId, setSelectedScrapBatchId] = useState<string | null>(null);
    const [selectedSourceName, setSelectedSourceName] = useState<string>(brandName);

    const sortedScraps = useMemo(() => {
        if (!allSocialScrapsData || allSocialScrapsData.length === 0) return [];
        return [...allSocialScrapsData].sort((a: any, b: any) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
    }, [allSocialScrapsData]);

    useEffect(() => {
        if (sortedScraps.length > 0) {
            const latestScrap = sortedScraps[0];
            setSelectedScrapBatchId(latestScrap.batch_id);
            setSelectedSourceName(brandName);
        }
    }, [sortedScraps, brandName]);

    const selectedScrap = useMemo(() => {
        if (!selectedScrapBatchId) return null;
        return sortedScraps.find((scrap: any) => scrap.batch_id === selectedScrapBatchId);
    }, [selectedScrapBatchId, sortedScraps]);

    const dataSources = useMemo(() => {
        if (!selectedScrap) return [];
        const sources = [{ name: brandName, data: selectedScrap.brand }];
        if (selectedScrap.competitors) {
            selectedScrap.competitors.forEach((comp: any) => {
                sources.push({ name: comp.competitor_name, data: comp });
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
            <div className="text-center p-8 text-muted-foreground h-[60vh] flex items-center justify-center flex-col gap-4">
                <p>No social media {SCRAPE} data available.</p>
                <ScrapeReportActionButtons
                    brand_id={brand_id}
                    website_batch_id={null}
                    social_batch_id={null}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className='flex items-center gap-2'>
                    <TooltipProvider>
                        {dataSources.map((source, index) => (
                            <React.Fragment key={source.name}>
                                {index === 1 && <div className="h-6 w-px bg-border" aria-hidden="true" />}
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
                                        <p>{index === 0 ? "Select Brand Social data" : "Select Competitor Social data"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </React.Fragment>
                        ))}
                    </TooltipProvider>
                </div>

                <div className='flex items-center gap-2'>
                    <ScrapeReportActionButtons
                        brand_id={brand_id}
                        website_batch_id={null}
                        social_batch_id={selectedScrapBatchId}
                    />
                    <TooltipProvider>
                        <Select onValueChange={handleScrapSelection} value={selectedScrapBatchId ?? ''}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder={`Select a ${SCRAPE} run`} />
                            </SelectTrigger>

                            <SelectContent>
                                {sortedScraps.map((scrap: any) => (
                                    <Tooltip key={scrap.batch_id}>
                                        <TooltipTrigger asChild>
                                            <SelectItem value={scrap.batch_id}>
                                                {timeAgo(scrap.scraped_at)}
                                            </SelectItem>
                                        </TooltipTrigger>

                                        <TooltipContent
                                            side="left"
                                            className=" px-1 mx-3 mt-2"
                                        >
                                            <DateRangeDisplay
                                                start_date={scrap?.start_date}
                                                end_date={scrap?.end_date}
                                            />
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </SelectContent>
                        </Select>
                    </TooltipProvider>
                </div>
            </div>
            <SocialDataView socialScrapedData={selectedDataSource} />
        </div>
    );
}