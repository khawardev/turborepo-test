'use client'

import { useState, useMemo, useEffect, startTransition, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from '@/lib/date-utils';
import WebsiteDataView from './WebsiteDataView';
import { ButtonSpinner } from '@/components/shared/spinner';
import { scrapeBatchWebsite } from '@/server/actions/scrapeActions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ScrapDataViewer({ allScrapsData, brandName, brand_id }: any) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [selectedScrapBatchId, setSelectedScrapBatchId] = useState<string | null>(null);
    const [selectedDataSource, setSelectedDataSource] = useState<any>(null);

    const sortedScraps = useMemo(() => {
        if (!allScrapsData || allScrapsData.length === 0) return [];
        return [...allScrapsData].sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
    }, [allScrapsData]);

    useEffect(() => {
        if (sortedScraps.length > 0) {
            const latestScrap = sortedScraps[0];
            setSelectedScrapBatchId(latestScrap.batch_id);
            setSelectedDataSource(latestScrap.brand);
        }
    }, [sortedScraps]);

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

    const handleScrapSelection = (batchId: string) => {
        const newScrap = sortedScraps.find((s: any) => s.batch_id === batchId);
        if (newScrap) {
            setSelectedScrapBatchId(batchId);
            setSelectedDataSource(newScrap.brand);
        }
    };

    if (sortedScraps.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground h-[75vh] flex items-center justify-center">
                No scrap data available.
            </div>
        );
    }

    if (!selectedScrap || !selectedDataSource) {
        return (
            <div className="text-center p-8 text-muted-foreground h-[75vh] flex items-center justify-center">
                Loading scrap data...
            </div>
        );
    }
    const scrapeBrand = () => {
        startTransition(async () => {
            const result = await scrapeBatchWebsite(brand_id);
            if (result.success) {
                router.refresh();
                toast.success("Scraping completed successfully 🎉");
            } else {
                toast.error("Scraping failed.");
            }
        });
    };
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-2">
                <div className='flex items-center gap-2'>
                    {dataSources.map(source => (
                        <Button
                            className='capitalize'
                            key={source.name}
                            variant={(selectedDataSource.name === source.name) || (source.name === brandName && !selectedDataSource.name) ? "outline" : "ghost"}
                            onClick={() => setSelectedDataSource(source.data)}
                        >
                            {source.name}
                        </Button>
                    ))}
               </div>

                <div className='flex items-center gap-2'>
                    <Button disabled={isPending} onClick={scrapeBrand}>
                        {isPending ? (
                            <ButtonSpinner>Scraping</ButtonSpinner>
                        ) : (
                            "Scrape"
                        )}
                    </Button>
                    <Select onValueChange={handleScrapSelection} value={selectedScrapBatchId ?? ''}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a scrap run" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedScraps.map((scrap: any, index: number) => (
                                <SelectItem key={scrap.batch_id} value={scrap.batch_id}>
                                    {`${index === 0 ? 'Latest' : formatDistanceToNow(scrap.scraped_at)} - ${new Date(scrap.scraped_at).toLocaleDateString()}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
               </div>
            </div>
            <WebsiteDataView scrapedData={selectedDataSource} />
        </div>
    );
}