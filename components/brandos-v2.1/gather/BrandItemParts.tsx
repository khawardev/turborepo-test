"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { EmptyStateCard } from "@/components/shared/CardsUI";
import { Skeleton } from "@/components/ui/skeleton";
import { getBatchWebsiteScrapeStatus } from '@/server/actions/ccba/website/websiteStatusAction';
import { getBatchSocialScrapeStatus } from '@/server/actions/ccba/social/socialStatusAction';

export function CompetitorsTable({ competitors }: { competitors: any[] }) {
    if (!competitors || competitors.length === 0) {
        return <EmptyStateCard message="No competitors found for this brand." />;
    }

    return (
        <div className="mt-2">
            <h4 className="text-md font-medium mb-2">Competitors</h4>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Socials</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {competitors.map((competitor: any) => (
                    <TableRow key={competitor.competitor_id}>
                    <TableCell className="font-medium">
                        {competitor.name}
                    </TableCell>
                    <TableCell>
                        <Link
                        href={competitor.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                        >
                        {competitor.url}
                        <LinkIcon className="size-3" />
                        </Link>
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                        {competitor.facebook_url && (
                            <Badge asChild variant="secondary">
                            <Link href={competitor.facebook_url} target="_blank" onClick={(e) => e.stopPropagation()}>
                                Facebook
                            </Link>
                            </Badge>
                        )}
                        {competitor.instagram_url && (
                            <Badge asChild variant="secondary">
                            <Link href={competitor.instagram_url} target="_blank" onClick={(e) => e.stopPropagation()}>
                                Instagram
                            </Link>
                            </Badge>
                        )}
                        {competitor.linkedin_url && (
                            <Badge asChild variant="secondary">
                            <Link href={competitor.linkedin_url} target="_blank" onClick={(e) => e.stopPropagation()}>
                                LinkedIn
                            </Link>
                            </Badge>
                        )}
                        {competitor.x_url && (
                            <Badge asChild variant="secondary">
                            <Link href={competitor.x_url} target="_blank" onClick={(e) => e.stopPropagation()}>
                                X
                            </Link>
                            </Badge>
                        )}
                        {competitor.youtube_url && (
                            <Badge asChild variant="secondary">
                            <Link href={competitor.youtube_url} target="_blank" onClick={(e) => e.stopPropagation()}>
                                YouTube
                            </Link>
                            </Badge>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function StatusBadge({ type, status }: { type: 'Website' | 'Social', status: string | null }) {
      if (!status) return null;

      const isCompleted = status === 'Completed' || status === 'CompletedWithErrors';
      const isFailed = status === 'Failed';
      const isProcessing = !isCompleted && !isFailed;

      if (isCompleted) {
          return (
              <Badge variant="outline">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mr-1.5" />
                  {type}
              </Badge>
          );
      }
      if (isProcessing) {
           return (
              <Badge variant="outline" className=" text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 flex items-center gap-1 h-6 text-[10px] px-2">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  {type}
              </Badge>
          );
      }
      if (isFailed) {
           return (
              <Badge variant="outline" className=" text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 flex items-center gap-1 h-6 text-[10px] px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {type}
              </Badge>
          );
      }
      return null;
}

interface PollingStatusBadgeProps {
    type: 'Website' | 'Social';
    initialStatus: string | null;
    brandId: string;
    batchId: string;
}

export function PollingStatusBadge({ type, initialStatus, brandId, batchId }: PollingStatusBadgeProps) {
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(initialStatus);

    const isProcessing = useCallback((s: string | null) => {
        if (!s) return false;
        const completedStatuses = ['Completed', 'CompletedWithErrors', 'Failed'];
        return !completedStatuses.includes(s);
    }, []);

    useEffect(() => {
        if (!isProcessing(status)) return;

        const checkStatus = async () => {
            try {
                if (type === 'Website') {
                    const res = await getBatchWebsiteScrapeStatus(brandId, batchId);
                    if (res?.status) {
                        setStatus(res.status);
                        if (!isProcessing(res.status)) {
                            router.refresh();
                        }
                    }
                } else {
                    const res = await getBatchSocialScrapeStatus(brandId, batchId);
                    if (res?.status) {
                        setStatus(res.status);
                        if (!isProcessing(res.status)) {
                            router.refresh();
                        }
                    }
                }
            } catch (e) {
                console.error('[PollingStatusBadge] Status check error:', e);
            }
        };

        const interval = setInterval(checkStatus, 15000);

        return () => clearInterval(interval);
    }, [status, type, brandId, batchId, isProcessing, router]);

    return <StatusBadge type={type} status={status} />;
}

export function CompetitorsSkeleton() {
    return (
        <div className="mt-6 space-y-2">
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="border rounded-md p-4 space-y-4">
                 <div className="flex gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                 </div>
                 {[1,2].map(i => (
                     <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                     </div>
                 ))}
            </div>
        </div>
    )
}

export function StatusBadgeSkeleton() {
    return <Skeleton className="h-6 w-16 rounded-full" />
}
