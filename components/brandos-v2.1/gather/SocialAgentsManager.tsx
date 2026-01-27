'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Trash2, Eye, ChevronDown, Loader2, Clock,
    FileText, Search, Sparkles, AlertCircle, MessageSquare, Edit
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MdOutlineArrowRight } from 'react-icons/md';
import {
    runSocialReportsAgent,
    getSocialReportsOutput,
    listSocialReportsTasks,
    deleteSocialReportsTask,
    type SocialChannelName,
    type AnalysisScope,
    type SocialReportsTaskListItem
} from '@/server/actions/socialReportsActions';
import { SocialReportsResultViewer } from './SocialReportsResultViewer';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SocialAgentsManagerProps = {
    clientId: string;
    brandId: string;
    batchSocialTaskId: string | null;
    brandName?: string;
    availableChannels: string[];
    competitors?: Array<{
        id: string;
        name: string;
        linkedin_url?: string;
        facebook_url?: string;
        instagram_url?: string;
        x_url?: string;
        youtube_url?: string;
        tiktok_url?: string;
    }>;
}

// Cache to store tasks by brandId to prevent reloading on tab switch
const TASKS_CACHE: Record<string, SocialReportsTaskListItem[]> = {};

export function SocialAgentsManager({
    clientId,
    brandId,
    batchSocialTaskId,
    brandName = 'Brand',
    availableChannels = [],
    competitors = []
}: SocialAgentsManagerProps) {
    const [reportsTasks, setReportsTasks] = useState<SocialReportsTaskListItem[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isRunningReports, setIsRunningReports] = useState(false);
    const [reportsTaskId, setReportsTaskId] = useState<string | null>(null);
    const [selectedReportsResult, setSelectedReportsResult] = useState<any>(null);
    const [loadingResultId, setLoadingResultId] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [analysisScope, setAnalysisScope] = useState<AnalysisScope>('brand');
    const [selectedChannel, setSelectedChannel] = useState<SocialChannelName>(
        (availableChannels[0] as SocialChannelName) || 'linkedin'
    );
    const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
    const [customInstruction, setCustomInstruction] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const getCompetitorChannels = (competitorId: string): string[] => {
        const competitor = competitors.find(c => c.id === competitorId);
        if (!competitor) return [];
        
        const channels: string[] = [];
        if (competitor.linkedin_url) channels.push('linkedin');
        if (competitor.facebook_url) channels.push('facebook');
        if (competitor.instagram_url) channels.push('instagram');
        if (competitor.x_url) channels.push('x');
        if (competitor.youtube_url) channels.push('youtube');
        if (competitor.tiktok_url) channels.push('tiktok');
        
        return channels;
    };

    const currentAvailableChannels = useMemo(() => {
        if (analysisScope === 'brand') {
            return availableChannels;
        } else if (analysisScope === 'competitors') {
            return selectedCompetitorId ? getCompetitorChannels(selectedCompetitorId) : [];
        }
        return [];
    }, [analysisScope, selectedCompetitorId, availableChannels, competitors]);

    const loadReportsTasks = useCallback(async () => {
        // Check cache first
        if (TASKS_CACHE[brandId]) {
            setReportsTasks(TASKS_CACHE[brandId]);
            setIsLoadingTasks(false);
        } else {
            setIsLoadingTasks(true);
        }

        try {
            const res = await listSocialReportsTasks({ client_id: clientId, brand_id: brandId });
            if (res.success && res.data?.tasks) {
                setReportsTasks(res.data.tasks);
                // Update cache
                TASKS_CACHE[brandId] = res.data.tasks;
            }
        } catch (e) {
            console.error('Failed to load social reports tasks:', e);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [clientId, brandId]);

    useEffect(() => {
        loadReportsTasks();
    }, [loadReportsTasks]);

    useEffect(() => {
        // When scope or competitor changes, we need to validate if selected channel is still valid
        // or default to the first available one
        if (currentAvailableChannels.length > 0) {
            if (!currentAvailableChannels.includes(selectedChannel)) {
                setSelectedChannel(currentAvailableChannels[0] as SocialChannelName);
            }
        }
    }, [currentAvailableChannels, selectedChannel]);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const handleRunReports = async () => {
        if (!batchSocialTaskId) {
            toast.error('No social batch data available. Please run data collection first.');
            return;
        }

        if (analysisScope === 'competitors' && !selectedCompetitorId && competitors.length > 0) {
            toast.error('Please select a competitor for competitor analysis.');
            return;
        }

        if (currentAvailableChannels.length === 0) {
             toast.error('No social channels available for the selected entity.');
             return;
        }

        setIsRunningReports(true);
        setSelectedReportsResult(null);
        toast.info(`Starting Social Reports Agent for ${selectedChannel}...`);

        try {
            const res = await runSocialReportsAgent({
                client_id: clientId,
                brand_id: brandId,
                batch_id: batchSocialTaskId,
                channel_name: selectedChannel,
                analysis_scope: analysisScope,
                competitor_id: analysisScope === 'competitors' ? (selectedCompetitorId || undefined) : undefined,
                instruction: customInstruction || undefined,
            });

            if (res.success && res.data?.task_id) {
                setReportsTaskId(res.data.task_id);
                toast.success('Social Reports Agent started! Polling for results...');
                pollReportsResult(res.data.task_id);
            } else {
                toast.error(`Social Reports Agent failed: ${res.error || 'Unknown error'}`);
                setIsRunningReports(false);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error starting Social Reports Agent');
            setIsRunningReports(false);
        }
    };

    const pollReportsResult = (taskId: string) => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }

        let attempts = 0;
        const maxAttempts = 120;

        pollIntervalRef.current = setInterval(async () => {
            attempts++;
            try {
                const res = await getSocialReportsOutput({
                    client_id: clientId,
                    brand_id: brandId,
                    task_id: taskId
                });

                if (res.success && res.data) {
                    setSelectedReportsResult(res.data);
                    toast.success('Social Reports complete!');
                    setIsRunningReports(false);
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    loadReportsTasks();
                } else if (attempts >= maxAttempts) {
                    toast.error('Report generation timed out. Please check back later.');
                    setIsRunningReports(false);
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                }
            } catch (e) {
                console.error('Polling reports error:', e);
            }
        }, 3000);
    };

    const handleViewReportsResult = async (taskId: string) => {
        setLoadingResultId(taskId);
        try {
            const res = await getSocialReportsOutput({
                client_id: clientId,
                brand_id: brandId,
                task_id: taskId
            });

            if (res.success && res.data) {
                setSelectedReportsResult(res.data);
                setReportsTaskId(taskId);
            } else {
                toast.error(`Failed to load result: ${res.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error loading report result');
        } finally {
            setLoadingResultId(null);
        }
    };

    const confirmDelete = (taskId: string) => {
        setTaskToDelete(taskId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        setDeletingTaskId(taskToDelete);
        try {
            const res = await deleteSocialReportsTask({
                client_id: clientId,
                brand_id: brandId,
                task_id: taskToDelete
            });

            if (res.success) {
                toast.success('Report task deleted');
                // Update cache immediately
                if (TASKS_CACHE[brandId]) {
                    TASKS_CACHE[brandId] = TASKS_CACHE[brandId].filter(t => t.task_id !== taskToDelete);
                }
                loadReportsTasks();
                if (selectedReportsResult?.task_id === taskToDelete) {
                    setSelectedReportsResult(null);
                }
            } else {
                toast.error(`Failed to delete: ${res.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error deleting task');
        } finally {
            setDeletingTaskId(null);
            setDeleteConfirmOpen(false);
            setTaskToDelete(null);
        }
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatExecutionTime = (seconds: number | string | undefined | null) => {
        if (seconds === undefined || seconds === null) return 'N/A';
        const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
        if (isNaN(numSeconds)) return 'N/A';
        if (numSeconds < 60) return `${numSeconds.toFixed(1)}s`;
        return `${(numSeconds / 60).toFixed(1)}m`;
    };

    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-1 gap-6">
                <Card className="overflow-hidden pt-0">
                    <CardHeader className="bg-linear-to-r from-pink-500/10 to-purple-500/10 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-pink-500/20 p-2.5 rounded-full">
                                    <MessageSquare className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Social Reports Agent</CardTitle>
                                    <CardDescription>Generate comprehensive reports from social media data</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px]">SOC-REPORTS</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={isRunningReports}>
                                        <Button variant="outline" className="h-9 justify-between capitalize">
                                            {analysisScope}
                                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => { setAnalysisScope('brand'); setSelectedCompetitorId(null); }}>Brand</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setAnalysisScope('competitors')}>Competitors</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {analysisScope === 'competitors' && competitors.length > 0 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild disabled={isRunningReports}>
                                            <Button variant="outline" className="h-9 justify-between min-w-[140px]">
                                                {selectedCompetitorId
                                                    ? competitors.find(c => c.id === selectedCompetitorId)?.name || 'Selected'
                                                    : <span className="text-muted-foreground">Select Competitor</span>
                                                }
                                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[180px]">
                                            {competitors.map((competitor) => (
                                                <DropdownMenuItem
                                                    key={competitor.id}
                                                    onClick={() => setSelectedCompetitorId(competitor.id)}
                                                >
                                                    {competitor.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={isRunningReports || currentAvailableChannels.length === 0}>
                                        <Button variant="outline" className="h-9 justify-between min-w-[140px] capitalize">
                                            <span className="flex items-center gap-2">
                                                {/* <span>{CHANNEL_ICONS[selectedChannel] || '📱'}</span> */}
                                                {selectedChannel}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {currentAvailableChannels.map((channel) => (
                                            <DropdownMenuItem
                                                key={channel}
                                                onClick={() => setSelectedChannel(channel as SocialChannelName)}
                                                className="capitalize"
                                            >
                                                {/* <span className="mr-2">{CHANNEL_ICONS[channel] || '📱'}</span> */}
                                                {channel}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    onClick={handleRunReports}
                                    disabled={
                                        isRunningReports ||
                                        !batchSocialTaskId ||
                                        currentAvailableChannels.length === 0 ||
                                        (analysisScope === 'competitors' && competitors.length > 0 && !selectedCompetitorId)
                                    }

                                >
                                    {isRunningReports ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            Generate Report
                                            <MdOutlineArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={loadReportsTasks}
                                    disabled={isLoadingTasks}
                                >
                                    <Loader2 className={cn("h-4 w-4", isLoadingTasks && "animate-spin")} />Refresh
                                </Button>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" title="Custom Instructions">
                                        <Edit className="h-4 w-4" /> Add Instructions
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Custom Instructions</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Add specific guidelines for the agent.
                                        </p>
                                        <Textarea
                                            placeholder="e.g., Focus on engagement metrics..."
                                            value={customInstruction}
                                            onChange={(e) => setCustomInstruction(e.target.value)}
                                            className="h-24 resize-none"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {!batchSocialTaskId && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>No social batch data available. Run data collection first.</span>
                            </div>
                        )}

                        {currentAvailableChannels.length === 0 && batchSocialTaskId && (
                             <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>No social channels with data available for the selected {analysisScope === 'brand' ? 'brand' : 'competitor'}.</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Report Tasks</span>
                                <Badge variant="secondary">{reportsTasks.length}</Badge>
                            </div>
                            <ScrollArea className="h-[320px] pt-4">
                                {isLoadingTasks ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border-2 bg-card">
                                                <div className="shrink-0">
                                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-5 w-28" />
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-4 w-36" />
                                                        <Skeleton className="h-4 w-16 rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-9 w-20 rounded-md" />
                                                    <Skeleton className="h-9 w-9 rounded-md" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : reportsTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-14">
                                        <FileText className="h-10 w-10 mb-3 opacity-40" />
                                        <span className="font-medium">No report tasks yet</span>
                                        <span className="text-xs mt-1 opacity-70">Generate a report to see it here</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {reportsTasks.map((task) => (
                                            <div
                                                key={task.task_id}
                                                className={cn(
                                                    "group relative flex items-center gap-4 p-4 rounded-xl border-2 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 cursor-pointer ",
                                                    selectedReportsResult?.task_id === task.task_id && "border-primary/50 bg-primary/5"
                                                )}
                                                onClick={() => handleViewReportsResult(task.task_id)}
                                            >
                                                <div className="shrink-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                                        task.analysis_scope === 'brand'
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-secondary text-secondary-foreground"
                                                    )}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm truncate">
                                                            {task.entity_name || 'Report'}
                                                        </span>
                                                        <Badge
                                                            variant={task.analysis_scope === 'brand' ? 'default' : 'secondary'}
                                                            className="text-[10px] px-2 py-0.5 font-medium capitalize"
                                                        >
                                                            {task.analysis_scope || 'brand'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {formatDate(task.timestamp)}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                                                            ⏱️ {formatExecutionTime(task.execution_time_seconds)}
                                                        </span>
                                                        {task.model_used && (
                                                            <span className="opacity-70 hidden sm:inline">
                                                                {task.model_used.includes('claude') ? '🤖 Claude' : task.model_used.slice(0, 10)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-3 gap-1.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewReportsResult(task.task_id);
                                                        }}
                                                        disabled={loadingResultId === task.task_id}
                                                    >
                                                        {loadingResultId === task.task_id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4" />
                                                                <span className="hidden sm:inline">View</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(task.task_id);
                                                        }}
                                                        disabled={deletingTaskId === task.task_id}
                                                    >
                                                        {deletingTaskId === task.task_id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>



            {selectedReportsResult && (
                <Card className="border rounded-xl p-6 bg-card">
                    <SocialReportsResultViewer
                        data={selectedReportsResult}
                        onReRun={handleRunReports}
                        isReRunning={isRunningReports}
                    />
                </Card>
            )}

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this report task? This action cannot be undone and all associated data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
