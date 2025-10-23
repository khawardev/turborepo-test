// 'use client'

// import React, { useState, useMemo, useEffect, useTransition } from 'react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import WebsiteDataView from '../../../dashboard/raw-data/website/WebsiteDataView';
// import { ButtonSpinner } from '@/components/shared/spinner';
// import { scrapeBatchWebsite } from '@/server/actions/scrapeActions';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { WebsiteAskLimitToast } from '@/components/brands/detail/scraps/tabs/website/WebsiteWebsiteAskLimitToast';
// import { timeAgo } from '@/lib/date-utils';
// import DashboardHeader from '@/components/dashboard/shared/DashboardHeader';
// import { WebsiteReportButton } from '../reports/tabs/website/WebsiteReportButton';
// import { Skeleton } from '@/components/ui/skeleton';

// const ScrapDataSkeleton = () => {
//     return (
//         <div className="space-y-6">
//             <div className="space-y-4  ">
//                 <div className="flex items-center space-x-4">
//                     <Skeleton className="h-4 w-[100px]" />
//                     <Skeleton className="h-4 w-[300px]" />
//                 </div>
//                 <Skeleton className="h-24 w-full" />
//             </div>
//             <div className="space-y-4  ">
//                 <div className="flex items-center space-x-4">
//                     <Skeleton className="h-4 w-[100px]" />
//                     <Skeleton className="h-4 w-[300px]" />
//                 </div>
//                 <Skeleton className="h-24 w-full" />
//             </div>
//             <div className="space-y-4  ">
//                 <div className="flex items-center space-x-4">
//                     <Skeleton className="h-4 w-[100px]" />
//                     <Skeleton className="h-4 w-[300px]" />
//                 </div>
//                 <Skeleton className="h-24 w-full" />
//             </div>
//         </div>
//     );
// }
// export default function ScrapDataViewer({ allScrapsData, brandName, brand_id }: any) {
//     const [isScrapingPending, startScrapingTransition] = useTransition();
//     const [isDataTransitioning, startDataTransition] = useTransition();
//     const router = useRouter();
//     const [selectedScrapBatchId, setSelectedScrapBatchId] = useState<string | null>(null);
//     const [selectedSourceName, setSelectedSourceName] = useState<string>(brandName);

//     const sortedScraps = useMemo(() => {
//         if (!allScrapsData || allScrapsData.length === 0) return [];
//         return [...allScrapsData].sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
//     }, [allScrapsData]);

//     useEffect(() => {
//         if (sortedScraps.length > 0) {
//             const latestScrap = sortedScraps[0];
//             if (latestScrap.batch_id !== selectedScrapBatchId) {
//                 setSelectedScrapBatchId(latestScrap.batch_id);
//                 setSelectedSourceName(brandName);
//             }
//         }
//     }, [sortedScraps, brandName, selectedScrapBatchId]);

//     const selectedScrap = useMemo(() => {
//         if (!selectedScrapBatchId) return null;
//         return sortedScraps.find((scrap: any) => scrap.batch_id === selectedScrapBatchId);
//     }, [selectedScrapBatchId, sortedScraps]);

//     const dataSources = useMemo(() => {
//         if (!selectedScrap) return [];
//         const sources = [{ name: brandName, data: selectedScrap.brand }];
//         if (selectedScrap.competitors) {
//             selectedScrap.competitors.forEach((comp: any) => {
//                 sources.push({ name: comp.name, data: comp });
//             });
//         }
//         return sources;
//     }, [selectedScrap, brandName]);

//     const selectedDataSource = useMemo(() => {
//         if (!selectedSourceName || dataSources.length === 0) return null;
//         return dataSources.find(source => source.name === selectedSourceName)?.data ?? null;
//     }, [selectedSourceName, dataSources]);

//     const handleScrapSelection = (batchId: string) => {
//         startDataTransition(() => {
//             setSelectedScrapBatchId(batchId);
//             setSelectedSourceName(brandName);
//         });
//     };

//     const handleSourceSelection = (name: string) => {
//         startDataTransition(() => {
//             setSelectedSourceName(name);
//         });
//     };

//     if (sortedScraps.length === 0) {
//         return (
//             <div className="text-center p-8 text-muted-foreground h-[75vh] flex items-center justify-center">
//                 No scrap data available.
//             </div>
//         );
//     }

//     const askLimit = () => {
//         toast.custom((t: any) => (
//             <WebsiteAskLimitToast
//                 t={t}
//                 onConfirm={(parsedLimit) => {
//                     scrapeBrand(parsedLimit)
//                 }}
//             />
//         ))
//     }

//     const scrapeBrand = async (limit: number) => {
//         startScrapingTransition(async () => {
//             const result = await scrapeBatchWebsite(brand_id, limit)
//             if (result?.success) {
//                 router.refresh()
//                 toast.success("Scraping completed successfully 🎉")
//             } else {
//                 toast.error("Scraping failed.")
//             }
//         })
//     }

//     return (
//         <div className="flex flex-col space-y-8">
//             <DashboardHeader
//                 title="Brands Scraps"
//                 subtitle="View all scraping reports and competitor data"
//             />

//             <div className="flex items-center justify-between gap-2">
//                 <div className='flex items-center gap-2'>
//                     <TooltipProvider>
//                         {dataSources.map((source, index) => (
//                             <React.Fragment key={source.name}>
//                                 {index === 1 && (
//                                     <div className="h-6 w-px bg-border" aria-hidden="true" />
//                                 )}
//                                 <Tooltip>
//                                     <TooltipTrigger asChild>
//                                         <Button
//                                             className='capitalize'
//                                             variant={selectedSourceName === source.name ? "outline" : "ghost"}
//                                             onClick={() => handleSourceSelection(source.name)}
//                                         >
//                                             {source.name}
//                                         </Button>
//                                     </TooltipTrigger>
//                                     <TooltipContent>
//                                         <p>{index === 0 ? "Select brand Scraped data" : "Select competitor Scraped data"}</p>
//                                     </TooltipContent>
//                                 </Tooltip>
//                             </React.Fragment>
//                         ))}
//                     </TooltipProvider>
//                 </div>

//                 <div className='flex items-center gap-2'>
//                     <Button disabled={isScrapingPending} onClick={askLimit}>
//                         {isScrapingPending ? (
//                             <ButtonSpinner>Scraping</ButtonSpinner>
//                         ) : (
//                             "Scrape"
//                         )}
//                     </Button>

//                     <WebsiteReportButton brand_id={brand_id} batch_id={selectedScrapBatchId ? selectedScrapBatchId : sortedScraps[0].batch_id} />

//                     <Select onValueChange={handleScrapSelection} value={selectedScrapBatchId ?? ''}>
//                         <SelectTrigger className="w-[140px]">
//                             <SelectValue placeholder="Select a scrap run" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {sortedScraps.map((scrap: any) => (
//                                 <SelectItem key={scrap.batch_id} value={scrap.batch_id}>
//                                     {timeAgo(scrap.scraped_at)}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>
//             </div>

//             {isDataTransitioning || !selectedDataSource ? (
//                 <ScrapDataSkeleton />
//             ) : (
//                 <WebsiteDataView scrapedData={selectedDataSource} />
//             )}
//         </div>
//     );
// }