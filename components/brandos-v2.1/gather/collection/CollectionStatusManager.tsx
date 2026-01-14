'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    LayoutGrid, 
    Play, 
    RotateCw, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Globe,
    Share2,
    ArrowRight
} from 'lucide-react';
import { scrapeBatchWebsite } from '@/server/actions/ccba/website/websiteScrapeActions';
import { scrapeBatchSocial } from '@/server/actions/ccba/social/socialScrapeActions';
import { getBatchWebsiteScrapeStatus } from '@/server/actions/ccba/website/websiteStatusAction';
import { getBatchSocialScrapeStatus } from '@/server/actions/ccba/social/socialStatusAction';
import { getCcbaTaskStatus } from '@/server/actions/ccba/statusActions';
import { setGatherCookies } from '@/server/actions/cookieActions';

type CollectionStatusManagerProps = {
    brandId: string;
    brandData: any;
    initialStatus: any;
    websiteBatchId: string | null;
    socialBatchId: string | null;
    websiteBatchStatus: string | null;
    socialBatchStatus: string | null;
    triggerScrape: boolean;
    webLimit: number;
    startDate: string;
    endDate: string;
};

export function CollectionStatusManager({
    brandId,
    brandData,
    initialStatus,
    websiteBatchId: initialWebBatchId,
    socialBatchId: initialSocialBatchId,
    websiteBatchStatus: initialWebStatus,
    socialBatchStatus: initialSocialStatus,
    triggerScrape,
    webLimit,
    startDate,
    endDate
}: CollectionStatusManagerProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [isStarting, startTransition] = useTransition();
    const [isPolling, setIsPolling] = useState(false);
    const [pollingMessage, setPollingMessage] = useState<string>('');

    const [currentWebBatchId, setCurrentWebBatchId] = useState<string | null>(initialWebBatchId);
    const [currentSocialBatchId, setCurrentSocialBatchId] = useState<string | null>(initialSocialBatchId);
    const [webBatchStatus, setWebBatchStatus] = useState<string | null>(initialWebStatus);
    const [socBatchStatus, setSocBatchStatus] = useState<string | null>(initialSocialStatus);

    const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

    useEffect(() => {
        if (brandId) {
            setGatherCookies({
                brandId,
                startDate,
                endDate,
                webLimit: webLimit.toString()
            }).catch(console.error);
        }
    }, [brandId, startDate, endDate, webLimit]);

    useEffect(() => {
        if (triggerScrape && !hasAutoTriggered && !isStarting && !isPolling) {
            if (status && status.total_running > 0) {
                setHasAutoTriggered(true);
                setIsPolling(true);
                return;
            }
            setHasAutoTriggered(true);
            handleStartCollection();
        }
    }, [triggerScrape, hasAutoTriggered]);

    useEffect(() => {
        if (initialWebStatus) setWebBatchStatus(initialWebStatus);
        if (initialSocialStatus) setSocBatchStatus(initialSocialStatus);
        if (initialWebBatchId) setCurrentWebBatchId(initialWebBatchId);
        if (initialSocialBatchId) setCurrentSocialBatchId(initialSocialBatchId);
    }, [initialWebStatus, initialSocialStatus, initialWebBatchId, initialSocialBatchId]);

    const isWebComplete = webBatchStatus === 'Completed' || webBatchStatus === 'CompletedWithErrors';
    const isSocialComplete = socBatchStatus === 'Completed' || socBatchStatus === 'CompletedWithErrors';
    const isAllComplete = isWebComplete && isSocialComplete;
    const isRunning = isStarting || isPolling || (status && status.total_running > 0);

    const checkBatchStatuses = useCallback(async () => {
        let webStatus = null;
        let socialStatus = null;

        if (currentWebBatchId) {
            webStatus = await getBatchWebsiteScrapeStatus(brandId, currentWebBatchId);
            if (webStatus?.status) setWebBatchStatus(webStatus.status);
        }
        if (currentSocialBatchId) {
            socialStatus = await getBatchSocialScrapeStatus(brandId, currentSocialBatchId);
            if (socialStatus?.status) setSocBatchStatus(socialStatus.status);
        }

        const taskStatus = await getCcbaTaskStatus(brandId);
        setStatus(taskStatus);

        return { webStatus, socialStatus, taskStatus };
    }, [brandId, currentWebBatchId, currentSocialBatchId]);

    useEffect(() => {
        if (!isPolling) return;
        let pollCount = 0;
        const maxPolls = 36;

        const interval = setInterval(async () => {
            pollCount++;
            setPollingMessage(`Checking status... (${pollCount})`);

            try {
                const { webStatus, socialStatus, taskStatus } = await checkBatchStatuses();

                const webDone = webStatus?.status === 'Completed' || webStatus?.status === 'CompletedWithErrors' || webStatus?.status === 'Failed';
                const socialDone = socialStatus?.status === 'Completed' || socialStatus?.status === 'CompletedWithErrors' || socialStatus?.status === 'Failed';
                const tasksRunning = taskStatus?.total_running > 0;

                if ((webDone || !currentWebBatchId) && (socialDone || !currentSocialBatchId) && !tasksRunning) {
                    toast.success('Data collection completed!');
                    setPollingMessage('');
                    clearInterval(interval);
                    setIsPolling(false);
                    router.push(`/dashboard/brandos-v2.1/gather/data/${brandId}`);
                    return;
                }

                let msgParts = [];
                if (webStatus?.progress) msgParts.push(`Web: ${webStatus.progress.completed}/${webStatus.progress.total_urls}`);
                if (socialStatus?.status) msgParts.push(`Social: ${socialStatus.status}`);

                setPollingMessage(msgParts.length > 0 ? msgParts.join(' | ') : 'Processing...');
            } catch (e) {
                console.error('[CollectionStatusManager] Polling error:', e);
            }

            if (pollCount >= maxPolls) {
                setIsPolling(false);
                setPollingMessage('');
                clearInterval(interval);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isPolling, checkBatchStatuses, router, brandId, currentWebBatchId, currentSocialBatchId]);

    const handleStartCollection = () => {
        startTransition(async () => {
            if (!startDate) {
                toast.error('Start Date is required.');
                return;
            }
            toast.info('Initializing Data Collection Swarm...');
            setWebBatchStatus('Initializing');
            setSocBatchStatus('Initializing');

            try {
                const webResult = await scrapeBatchWebsite(brandId, webLimit);
                if (!webResult?.success) {
                    toast.error(`Website capture failed: ${webResult?.message}`);
                    return;
                }
                if (webResult.data?.task_id) setCurrentWebBatchId(webResult.data.task_id);

                const socialResult = await scrapeBatchSocial(brandId, startDate, endDate);
                if (!socialResult?.success) {
                    toast.error(`Social capture failed: ${socialResult?.message}`);
                    return;
                }

                const sBatchId = socialResult.data?.task_id || socialResult.data?.batch_id;
                if (sBatchId) setCurrentSocialBatchId(sBatchId);

                toast.success('Swarm agents deployed.');
                setIsPolling(true);
            } catch (e) {
                console.error(e);
                toast.error('Trigger error');
            }
        });
    };

    return (
        <div className="space-y-8 w-full pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-medium tracking-tight">{brandData.name}</h3>
                    <p className="text-muted-foreground">Data Collection Status</p>
                </div>
                {pollingMessage && <p className="text-sm text-blue-500 mt-1">{pollingMessage}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <StatusCard
                    title="Website Data Gathering"
                    icon={Globe}
                    status={webBatchStatus}
                    batchId={currentWebBatchId}
                    isRunning={isRunning && !isWebComplete}
                />
                <StatusCard
                    title="Social Media Data Gathering"
                    icon={Share2}
                    status={socBatchStatus}
                    batchId={currentSocialBatchId}
                    isRunning={isRunning && !isSocialComplete}
                />
            </div>

            <div className="flex gap-4">
                {!isRunning && !isAllComplete && (
                    <Button onClick={handleStartCollection} disabled={isStarting}>
                        {isStarting ? (
                            <><RotateCw className="w-4 h-4 mr-2 animate-spin" /> Starting...</>
                        ) : (
                            <><Play className="w-4 h-4 mr-2" /> Start Collection</>
                        )}
                    </Button>
                )}

                {isAllComplete && (
                    <Button asChild>
                        <Link href={`/dashboard/brandos-v2.1/gather/data/${brandId}`}>
                            View Collected Data
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                )}
            </div>

            {isRunning && (
                <Card>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            <div>
                                <p className="font-medium text-blue-700 dark:text-blue-300">
                                    Collection in Progress
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    You can leave this page. The collection will continue in the background.
                                </p>
                            </div>
                        </div>
                        <Progress value={undefined} className="h-2 w-full mt-4 animate-pulse" />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StatusCard({
    title,
    icon: Icon,
    status,
    batchId,
    isRunning
}: {
    title: string;
    icon: any;
    status: string | null;
    batchId: string | null;
    isRunning: boolean;
}) {
    const getStatusBadge = () => {
        if (isRunning) {
            return (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Processing
                </Badge>
            );
        }
        if (status === 'Completed' || status === 'CompletedWithErrors') {
            return (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {status}
                </Badge>
            );
        }
        if (status === 'Failed') {
            return (
                <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Failed
                </Badge>
            );
        }
        if (status) {
            return <Badge variant="outline">{status}</Badge>;
        }
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {title}
                </CardTitle>
                {getStatusBadge()}
            </CardHeader>
            <CardContent>
                {batchId && (
                    <p className="text-xs text-muted-foreground font-mono truncate">
                        Batch: {batchId}
                    </p>
                )}
                {isRunning && <Progress value={undefined} className="h-1 mt-2 animate-pulse" />}
            </CardContent>
        </Card>
    );
}
