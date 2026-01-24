'use client';

import { useEffect, useRef, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
    Loader2, 
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
import { ScrapeStatusBadge } from '@/components/brandos-v2.1/gather/ScrapeStatusBadge';

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
    websiteBatchError?: string | null;
    socialBatchError?: string | null;
};

type CollectionState = {
    webBatchId: string | null;
    socialBatchId: string | null;
    webStatus: string | null;
    socialStatus: string | null; 
    webError: string | null;
    socialError: string | null;
    isPolling: boolean;
    pollingMessage: string;
    isStarting: boolean;
    hasAutoTriggered: boolean;
    taskStatus: any;
};

type CollectionAction =
    | { type: 'SET_WEB_BATCH'; payload: { id: string; status?: string } }
    | { type: 'SET_SOCIAL_BATCH'; payload: { id: string; status?: string } }
    | { type: 'UPDATE_WEB_STATUS'; payload: { status: string; error?: string } }
    | { type: 'UPDATE_SOCIAL_STATUS'; payload: { status: string; error?: string } }
    | { type: 'SET_POLLING'; payload: boolean }
    | { type: 'SET_POLLING_MESSAGE'; payload: string }
    | { type: 'SET_STARTING'; payload: boolean }
    | { type: 'SET_AUTO_TRIGGERED' }
    | { type: 'SET_TASK_STATUS'; payload: any }
    | { type: 'INIT_COLLECTION' };

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
    switch (action.type) {
        case 'SET_WEB_BATCH':
            return { ...state, webBatchId: action.payload.id, webStatus: action.payload.status || state.webStatus };
        case 'SET_SOCIAL_BATCH':
            return { ...state, socialBatchId: action.payload.id, socialStatus: action.payload.status || state.socialStatus };
        case 'UPDATE_WEB_STATUS':
            return { ...state, webStatus: action.payload.status, webError: action.payload.error || state.webError };
        case 'UPDATE_SOCIAL_STATUS':
            return { ...state, socialStatus: action.payload.status, socialError: action.payload.error || state.socialError };
        case 'SET_POLLING':
            return { ...state, isPolling: action.payload };
        case 'SET_POLLING_MESSAGE':
            return { ...state, pollingMessage: action.payload };
        case 'SET_STARTING':
            return { ...state, isStarting: action.payload };
        case 'SET_AUTO_TRIGGERED':
            return { ...state, hasAutoTriggered: true };
        case 'SET_TASK_STATUS':
            return { ...state, taskStatus: action.payload };
        case 'INIT_COLLECTION':
            return { ...state, webStatus: 'Initializing', socialStatus: 'Initializing', isStarting: true };
        default:
            return state;
    }
}

function isComplete(status: string | null): boolean {
    return status === 'Completed' || status === 'CompletedWithErrors' || status === 'Failed';
}

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
    endDate,
    websiteBatchError,
    socialBatchError
}: CollectionStatusManagerProps) {
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollCountRef = useRef(0);
    const maxPolls = 36;

    const [state, dispatch] = useReducer(collectionReducer, {
        webBatchId: initialWebBatchId,
        socialBatchId: initialSocialBatchId,
        webStatus: initialWebStatus,
        socialStatus: initialSocialStatus,
        webError: websiteBatchError || null,
        socialError: socialBatchError || null,
        isPolling: false,
        pollingMessage: '',
        isStarting: false,
        hasAutoTriggered: false,
        taskStatus: initialStatus
    });

    const isWebComplete = isComplete(state.webStatus);
    const isSocialComplete = isComplete(state.socialStatus);
    const isAllComplete = isWebComplete && isSocialComplete;
    const isRunning = state.isStarting || state.isPolling || (state.taskStatus?.total_running > 0);

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
        if (triggerScrape && !state.hasAutoTriggered && !state.isStarting && !state.isPolling) {
            dispatch({ type: 'SET_AUTO_TRIGGERED' });
            if (state.taskStatus?.total_running > 0) {
                dispatch({ type: 'SET_POLLING', payload: true });
                return;
            }
            handleStartCollection();
        }
    }, [triggerScrape, state.hasAutoTriggered, state.isStarting, state.isPolling, state.taskStatus]);

    useEffect(() => {
        if (!state.isPolling) return;

        const poll = async () => {
            pollCountRef.current++;
            dispatch({ type: 'SET_POLLING_MESSAGE', payload: `Checking status... (${pollCountRef.current})` });

            try {
                let webRes = null;
                let socialRes = null;

                if (state.webBatchId) {
                    webRes = await getBatchWebsiteScrapeStatus(brandId, state.webBatchId);
                    if (webRes?.status) {
                        dispatch({ type: 'UPDATE_WEB_STATUS', payload: { status: webRes.status, error: webRes.error } });
                    }
                }

                if (state.socialBatchId) {
                    socialRes = await getBatchSocialScrapeStatus(brandId, state.socialBatchId);
                    if (socialRes?.status) {
                        dispatch({ type: 'UPDATE_SOCIAL_STATUS', payload: { status: socialRes.status, error: socialRes.error } });
                    }
                }

                const taskStatus = await getCcbaTaskStatus(brandId);
                dispatch({ type: 'SET_TASK_STATUS', payload: taskStatus });

                const webDone = isComplete(webRes?.status) || !state.webBatchId;
                const socialDone = isComplete(socialRes?.status) || !state.socialBatchId;
                const tasksRunning = taskStatus?.total_running > 0;

                if (webDone && socialDone && !tasksRunning) {
                    toast.success('Data collection completed!');
                    dispatch({ type: 'SET_POLLING_MESSAGE', payload: '' });
                    dispatch({ type: 'SET_POLLING', payload: false });
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    router.push(`/dashboard/brandos-v2.1/gather/data/${brandId}`);
                    return;
                }

                const msgParts = [];
                if (webRes?.progress) msgParts.push(`Web: ${webRes.progress.completed}/${webRes.progress.total_urls}`);
                if (socialRes?.status) msgParts.push(`Social: ${socialRes.status}`);
                dispatch({ type: 'SET_POLLING_MESSAGE', payload: msgParts.length > 0 ? msgParts.join(' | ') : 'Processing...' });

            } catch (e: any) {
                console.error('[CollectionStatusManager] Polling error:', e);
            }

            if (pollCountRef.current >= maxPolls) {
                dispatch({ type: 'SET_POLLING', payload: false });
                dispatch({ type: 'SET_POLLING_MESSAGE', payload: '' });
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        intervalRef.current = setInterval(poll, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [state.isPolling, state.webBatchId, state.socialBatchId, brandId, router]);

    const handleStartCollection = async () => {
        if (!startDate) {
            toast.error('Start Date is required.');
            return;
        }

        dispatch({ type: 'INIT_COLLECTION' });
        toast.info('Initializing Data Collection Swarm...');

        try {
            const webResult = await scrapeBatchWebsite(brandId, webLimit);
            
            if (!webResult?.success) {
                toast.error(`Website capture failed: ${webResult?.message}`);
                dispatch({ type: 'UPDATE_WEB_STATUS', payload: { status: 'Failed' } });
            } else {
                const webBatchId = webResult.data?.task_id || webResult.data?.batch_id;
                if (webBatchId) dispatch({ type: 'SET_WEB_BATCH', payload: { id: webBatchId, status: 'Processing' } });
            }

            const socialResult = await scrapeBatchSocial(brandId, startDate, endDate);

            if (!socialResult?.success) {
                toast.error(`Social capture failed: ${socialResult?.message}`);
                dispatch({ type: 'UPDATE_SOCIAL_STATUS', payload: { status: 'Failed' } });
            } else {
                const sBatchId = socialResult.data?.task_id || socialResult.data?.batch_id;
                if (sBatchId) dispatch({ type: 'SET_SOCIAL_BATCH', payload: { id: sBatchId, status: 'Processing' } });
            }

            dispatch({ type: 'SET_STARTING', payload: false });

            if (webResult?.success || socialResult?.success) {
                toast.success('Swarm agents deployed.');
                pollCountRef.current = 0;
                dispatch({ type: 'SET_POLLING', payload: true });
            }
        } catch (e: any) {
            console.error('[handleStartCollection] Critical error:', e);
            toast.error(`Collection error: ${e?.message || 'Unknown error'}`);
            dispatch({ type: 'SET_STARTING', payload: false });
        }
    };

    return (
        <div className="space-y-8 w-full pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-medium tracking-tight">{brandData.name}</h3>
                    <p className="text-muted-foreground">Data Collection Status</p>
                </div>
                {state.pollingMessage && <p className="text-sm text-blue-500 mt-1">{state.pollingMessage}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <StatusCard
                    title="Website Data Gathering"
                    icon={Globe}
                    status={state.webStatus}
                    batchId={state.webBatchId}
                    isRunning={isRunning && !isWebComplete}
                    error={state.webError}
                />
                <StatusCard
                    title="Social Media Data Gathering"
                    icon={Share2}
                    status={state.socialStatus}
                    batchId={state.socialBatchId}
                    isRunning={isRunning && !isSocialComplete}
                    error={state.socialError}
                />
            </div>

            <div className="flex gap-4">
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
    isRunning,
    error
}: {
    title: string;
    icon: any;
    status: string | null;
    batchId: string | null;
    isRunning: boolean;
    error?: string | null;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {title}
                </CardTitle>
                <ScrapeStatusBadge
                    label={status || 'Pending'}
                    status={status}
                    error={error}
                    showLabel={true}
                    size="md"
                />
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
