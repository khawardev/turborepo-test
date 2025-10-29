'use client'

import React, { useState, useMemo, useTransition, useEffect } from 'react';
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

export default function WebsiteScraps({ allScrapsData, brandName, brand_id }: any) {
    const [isScrapingPending, startScrapingTransition] = useTransition();
    const router = useRouter();

    const sortedScraps = useMemo(() => {
        if (!allScrapsData || allScrapsData.length === 0) return [];
        return [...allScrapsData].sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
    }, [allScrapsData]);

    const [selectedScrapBatchId, setSelectedScrapBatchId] = useState<string | null>(sortedScraps[0]?.batch_id ?? null);
    const [selectedCompetitorName, setSelectedCompetitorName] = useState<string | null>(null);

    useEffect(() => {
        if (sortedScraps.length > 0 && !selectedScrapBatchId) {
            setSelectedScrapBatchId(sortedScraps[0].batch_id);
        }
    }, [sortedScraps, selectedScrapBatchId]);

    const selectedScrap = useMemo(() => {
        return sortedScraps.find((scrap: any) => scrap.batch_id === selectedScrapBatchId) ?? null;
    }, [selectedScrapBatchId, sortedScraps]);

    const selectedDataSource = useMemo(() => {
        if (!selectedScrap) return null;
        if (selectedCompetitorName) {
            return selectedScrap.competitors?.find((comp: any) => comp.name === selectedCompetitorName) ?? null;
        }
        return selectedScrap.brand;
    }, [selectedScrap, selectedCompetitorName]);

    const handleScrapSelection = (batchId: string) => {
        setSelectedScrapBatchId(batchId);
        setSelectedCompetitorName(null);
    };

    const handleSourceSelection = (name: string) => {
        if (name === brandName) {
            setSelectedCompetitorName(null);
        } else {
            setSelectedCompetitorName(name);
        }
    };

    const scrapeBrand = async (limit: number) => {
        startScrapingTransition(async () => {
            const result = await scrapeBatchWebsite(brand_id, limit);
            if (result?.success) {
                router.refresh();
                toast.success("Scraping completed successfully 🎉");
            } else {
                toast.error("Scraping failed.");
            }
        });
    };

    const askLimit = () => {
        toast.custom((t: any) => (
            <WebsiteAskLimitToast
                t={t}
                onConfirm={scrapeBrand}
            />
        ));
    };

    if (sortedScraps.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground h-[60vh] flex items-center justify-center">
                No website scrap data available.
            </div>
        );
    }

    const selectedSourceName = selectedCompetitorName ?? brandName;
    const competitors = selectedScrap?.competitors ?? [];

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div className='flex items-center gap-2'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className='capitalize'
                                    variant={selectedSourceName === brandName ? "outline" : "ghost"}
                                    onClick={() => handleSourceSelection(brandName)}
                                >
                                    {brandName}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Select Brand Website data</p>
                            </TooltipContent>
                        </Tooltip>

                        {competitors.length > 0 && (
                            <div className="h-6 w-px bg-border" aria-hidden="true" />
                        )}

                        {competitors.map((comp: any) => (
                            <Tooltip key={comp.name}>
                                <TooltipTrigger asChild>
                                    <Button
                                        className='capitalize'
                                        variant={selectedSourceName === comp.name ? "outline" : "ghost"}
                                        onClick={() => handleSourceSelection(comp.name)}
                                    >
                                        {comp.name}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Select Competitor Website data</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>

                <div className='flex items-center gap-2'>
                    <Button disabled={isScrapingPending} onClick={askLimit}>
                        {isScrapingPending ? <ButtonSpinner>Scraping...</ButtonSpinner> : "Scrape Again"}
                    </Button>
                    <WebsiteReportButton brand_id={brand_id} batch_id={selectedScrapBatchId} />
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
            <WebsiteDataView websiteScrapsData={selectedDataSource} />
        </div>
    );
}