'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { 
    Play, Trash2, Eye, ChevronDown, Loader2, Clock, Cpu, 
    FileText, RefreshCw, Search, Database, Sparkles, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MdOutlineArrowRight } from 'react-icons/md';
import { 
    runWebExtractionAgent, 
    getWebExtractionOutput, 
    listWebExtractionTasks, 
    deleteWebExtractionTask,
    runWebSynthesisAgent,
    getWebSynthesisOutput,
    listWebSynthesisTasks,
    deleteWebSynthesisTask,
    type WebExtractionTask,
    type WebSynthesisTask
} from '@/server/actions/webAuditorActions';
import { WebExtractionResultViewer } from './WebExtractionResultViewer';
import { WebSynthesisResultViewer } from './WebSynthesisResultViewer';
import { Spinner } from '@/components/shared/SpinnerLoader';
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

type WebAgentsManagerProps = {
    clientId: string;
    brandId: string;
    batchWebsiteTaskId: string | null;
    brandName?: string;
    competitors?: Array<{ id: string; name: string }>;
}

export function WebAgentsManager({ 
    clientId, 
    brandId, 
    batchWebsiteTaskId,
    brandName = 'Brand',
    competitors = []
}: WebAgentsManagerProps) {
    const [extractionTasks, setExtractionTasks] = useState<WebExtractionTask[]>([]);
    const [synthesisTasks, setSynthesisTasks] = useState<WebSynthesisTask[]>([]);
    const [isLoadingExtractionTasks, setIsLoadingExtractionTasks] = useState(true);
    const [isLoadingSynthesisTasks, setIsLoadingSynthesisTasks] = useState(true);
    const [isRunningExtraction, setIsRunningExtraction] = useState(false);
    const [isRunningSynthesis, setIsRunningSynthesis] = useState(false);
    const [extractionTaskId, setExtractionTaskId] = useState<string | null>(null);
    const [synthesisTaskId, setSynthesisTaskId] = useState<string | null>(null);
    const [selectedExtractionResult, setSelectedExtractionResult] = useState<any>(null);
    const [selectedSynthesisResult, setSelectedSynthesisResult] = useState<any>(null);
    const [loadingResultId, setLoadingResultId] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [extractionScope, setExtractionScope] = useState<'brand' | 'competitors'>('brand');
    const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
    const [selectedExtractionForSynthesis, setSelectedExtractionForSynthesis] = useState<string | null>(null);
    const [customInstruction, setCustomInstruction] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<{ id: string; type: 'extraction' | 'synthesis' } | null>(null);

    const loadExtractionTasks = useCallback(async () => {
        setIsLoadingExtractionTasks(true);
        try {
            const res = await listWebExtractionTasks({ client_id: clientId, brand_id: brandId });
            if (res.success && res.data?.tasks) {
                setExtractionTasks(res.data.tasks);
            }
        } catch (e) {
            console.error('Failed to load extraction tasks:', e);
        } finally {
            setIsLoadingExtractionTasks(false);
        }
    }, [clientId, brandId]);

    const loadSynthesisTasks = useCallback(async () => {
        setIsLoadingSynthesisTasks(true);
        try {
            const res = await listWebSynthesisTasks({ client_id: clientId, brand_id: brandId });
            if (res.success && res.data?.tasks) {
                setSynthesisTasks(res.data.tasks);
            }
        } catch (e) {
            console.error('Failed to load synthesis tasks:', e);
        } finally {
            setIsLoadingSynthesisTasks(false);
        }
    }, [clientId, brandId]);

    useEffect(() => {
        loadExtractionTasks();
        loadSynthesisTasks();
    }, [loadExtractionTasks, loadSynthesisTasks]);

    const handleRunExtraction = async () => {
        if (!batchWebsiteTaskId) {
            toast.error('No website batch data available. Please run data collection first.');
            return;
        }

        if (extractionScope === 'competitors' && !selectedCompetitorId && competitors.length > 0) {
            toast.error('Please select a competitor for competitor analysis.');
            return;
        }

        setIsRunningExtraction(true);
        toast.info(`Starting Web Extraction for ${extractionScope}...`);

        try {
            const res = await runWebExtractionAgent({
                client_id: clientId,
                brand_id: brandId,
                batch_website_task_id: batchWebsiteTaskId,
                analysis_scope: extractionScope,
                competitor_id: extractionScope === 'competitors' ? (selectedCompetitorId || undefined) : undefined,
                instruction: customInstruction || undefined,
            });

            if (res.success && res.data?.task_id) {
                setExtractionTaskId(res.data.task_id);
                toast.success('Web Extraction started! Polling for results...');
                pollExtractionResult(res.data.task_id);
            } else {
                toast.error(`Extraction failed: ${res.error || 'Unknown error'}`);
                setIsRunningExtraction(false);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error starting Web Extraction');
            setIsRunningExtraction(false);
        }
    };

    const pollExtractionResult = async (taskId: string) => {
        let attempts = 0;
        const maxAttempts = 120;
        
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await getWebExtractionOutput({
                    client_id: clientId,
                    brand_id: brandId,
                    task_id: taskId
                });

                if (res.success && res.data) {
                    setSelectedExtractionResult(res.data);
                    toast.success('Web Extraction complete!');
                    setIsRunningExtraction(false);
                    clearInterval(interval);
                    loadExtractionTasks();
                } else if (attempts >= maxAttempts) {
                    toast.error('Extraction timed out. Please check back later.');
                    setIsRunningExtraction(false);
                    clearInterval(interval);
                }
            } catch (e) {
                console.error('Polling extraction error:', e);
            }
        }, 3000);
    };

    const handleRunSynthesis = async () => {
        if (!selectedExtractionForSynthesis) {
            toast.error('Please select an extraction task to synthesize.');
            return;
        }

        setIsRunningSynthesis(true);
        toast.info('Starting Web Synthesis...');

        try {
            const res = await runWebSynthesisAgent({
                client_id: clientId,
                brand_id: brandId,
                extraction_task_id: selectedExtractionForSynthesis,
                instruction: customInstruction || undefined,
            });

            if (res.success && res.data?.task_id) {
                setSynthesisTaskId(res.data.task_id);
                toast.success('Web Synthesis started! Polling for results...');
                pollSynthesisResult(res.data.task_id);
            } else {
                toast.error(`Synthesis failed: ${res.error || 'Unknown error'}`);
                setIsRunningSynthesis(false);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error starting Web Synthesis');
            setIsRunningSynthesis(false);
        }
    };

    const pollSynthesisResult = async (taskId: string) => {
        let attempts = 0;
        const maxAttempts = 120;
        
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await getWebSynthesisOutput({
                    client_id: clientId,
                    brand_id: brandId,
                    task_id: taskId
                });

                if (res.success && res.data) {
                    setSelectedSynthesisResult(res.data);
                    toast.success('Web Synthesis complete!');
                    setIsRunningSynthesis(false);
                    clearInterval(interval);
                    loadSynthesisTasks();
                } else if (attempts >= maxAttempts) {
                    toast.error('Synthesis timed out. Please check back later.');
                    setIsRunningSynthesis(false);
                    clearInterval(interval);
                }
            } catch (e) {
                console.error('Polling synthesis error:', e);
            }
        }, 3000);
    };

    const handleViewExtractionResult = async (taskId: string) => {
        setLoadingResultId(taskId);
        try {
            const res = await getWebExtractionOutput({
                client_id: clientId,
                brand_id: brandId,
                task_id: taskId
            });

            if (res.success && res.data) {
                setSelectedExtractionResult(res.data);
                setSelectedSynthesisResult(null);
            } else {
                toast.error(`Failed to load result: ${res.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error loading extraction result');
        } finally {
            setLoadingResultId(null);
        }
    };

    const handleViewSynthesisResult = async (taskId: string) => {
        setLoadingResultId(taskId);
        try {
            const res = await getWebSynthesisOutput({
                client_id: clientId,
                brand_id: brandId,
                task_id: taskId
            });

            if (res.success && res.data) {
                setSelectedSynthesisResult(res.data);
                setSelectedExtractionResult(null);
            } else {
                toast.error(`Failed to load result: ${res.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error loading synthesis result');
        } finally {
            setLoadingResultId(null);
        }
    };

    const confirmDelete = (taskId: string, type: 'extraction' | 'synthesis') => {
        setTaskToDelete({ id: taskId, type });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        setDeletingTaskId(taskToDelete.id);
        try {
            let res;
            if (taskToDelete.type === 'extraction') {
                res = await deleteWebExtractionTask({
                    client_id: clientId,
                    brand_id: brandId,
                    task_id: taskToDelete.id
                });
                if (res.success) {
                    toast.success('Extraction task deleted');
                    loadExtractionTasks();
                    if (selectedExtractionResult?.task_id === taskToDelete.id) {
                        setSelectedExtractionResult(null);
                    }
                }
            } else {
                res = await deleteWebSynthesisTask({
                    client_id: clientId,
                    brand_id: brandId,
                    task_id: taskToDelete.id
                });
                if (res.success) {
                    toast.success('Synthesis task deleted');
                    loadSynthesisTasks();
                    if (selectedSynthesisResult?.task_id === taskToDelete.id) {
                        setSelectedSynthesisResult(null);
                    }
                }
            }

            if (!res?.success) {
                toast.error(`Failed to delete: ${res?.error || 'Unknown error'}`);
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
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="overflow-hidden pt-0">
                    <CardHeader className="bg-linear-to-r from-blue-500/10 to-cyan-500/10 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2.5 rounded-full">
                                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Web Extraction Agent</CardTitle>
                                    <CardDescription>Extract structured data from website content</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px]">WEB-EXTRACT</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild disabled={isRunningExtraction}>
                                    <Button variant="outline" className="h-9 justify-between capitalize">
                                        {extractionScope}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => { setExtractionScope('brand'); setSelectedCompetitorId(null); }}>Brand</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setExtractionScope('competitors')}>Competitors</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {extractionScope === 'competitors' && competitors.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={isRunningExtraction}>
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
                            
                            <Button 
                                onClick={handleRunExtraction} 
                                disabled={
                                    isRunningExtraction || 
                                    !batchWebsiteTaskId ||
                                    (extractionScope === 'competitors' && competitors.length > 0 && !selectedCompetitorId)
                                }
                                className="gap-2"
                            >
                                {isRunningExtraction ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Extracting...
                                    </>
                                ) : (
                                    <>
                                        Run Extraction
                                        <MdOutlineArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={loadExtractionTasks}
                                disabled={isLoadingExtractionTasks}
                            >
                                <RefreshCw className={cn("h-4 w-4", isLoadingExtractionTasks && "animate-spin")} />
                            </Button>
                        </div>

                        {!batchWebsiteTaskId && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>No website batch data available. Run data collection first.</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Extraction Tasks</span>
                                <Badge variant="secondary">{extractionTasks.length}</Badge>
                            </div>
                            <ScrollArea className="h-[200px] border rounded-lg">
                                {isLoadingExtractionTasks ? (
                                    <div className="flex items-center justify-center h-full py-24">
                                        <Spinner />
                                    </div>
                                ) : extractionTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-14">
                                        <Database className="h-8 w-8 mb-2 opacity-50" />
                                        <span>No extraction tasks yet</span>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {extractionTasks.map((task) => (
                                            <div 
                                                key={task.task_id} 
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
                                                    selectedExtractionResult?.task_id === task.task_id && "ring-2 ring-primary"
                                                )}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <code className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">
                                                            {task.task_id.slice(0, 8)}...
                                                        </code>
                                                        <Badge variant="outline" className="text-[9px] py-0">
                                                            {formatExecutionTime(task.execution_time_seconds)}
                                                        </Badge>
                                                        {task.model_used && (
                                                            <Badge variant="secondary" className="text-[8px] py-0 px-1">
                                                                {task.model_used.includes('claude') ? 'Claude' : task.model_used.slice(0, 12)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(task.timestamp)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7"
                                                        onClick={() => handleViewExtractionResult(task.task_id)}
                                                        disabled={loadingResultId === task.task_id}
                                                    >
                                                        {loadingResultId === task.task_id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Eye className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => confirmDelete(task.task_id, 'extraction')}
                                                        disabled={deletingTaskId === task.task_id}
                                                    >
                                                        {deletingTaskId === task.task_id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
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

                <Card className="overflow-hidden pt-0">
                    <CardHeader className="bg-linear-to-r from-purple-500/10 to-pink-500/10 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500/20 p-2.5 rounded-full">
                                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Web Synthesis Agent</CardTitle>
                                    <CardDescription>Generate comprehensive analysis reports</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px]">WEB-SYNTH</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild disabled={isRunningSynthesis || extractionTasks.length === 0}>
                                    <Button variant="outline" className="h-9 justify-between min-w-[180px]">
                                        {selectedExtractionForSynthesis ? (
                                            <span className="truncate text-xs font-mono">
                                                {selectedExtractionForSynthesis.slice(0, 12)}...
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">Select Extraction</span>
                                        )}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[220px]">
                                    {extractionTasks.map((task) => (
                                        <DropdownMenuItem 
                                            key={task.task_id}
                                            onClick={() => setSelectedExtractionForSynthesis(task.task_id)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs">{task.task_id.slice(0, 16)}...</span>
                                                <span className="text-[10px] text-muted-foreground">{formatDate(task.timestamp)}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button 
                                onClick={handleRunSynthesis} 
                                disabled={isRunningSynthesis || !selectedExtractionForSynthesis}
                                className="gap-2"
                            >
                                {isRunningSynthesis ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Synthesizing...
                                    </>
                                ) : (
                                    <>
                                        Run Synthesis
                                        <MdOutlineArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={loadSynthesisTasks}
                                disabled={isLoadingSynthesisTasks}
                            >
                                <RefreshCw className={cn("h-4 w-4", isLoadingSynthesisTasks && "animate-spin")} />
                            </Button>
                        </div>

                        {extractionTasks.length === 0 && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>Run an extraction task first before synthesis.</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Synthesis Tasks</span>
                                <Badge variant="secondary">{synthesisTasks.length}</Badge>
                            </div>
                            <ScrollArea className="h-[200px] border rounded-lg">
                                {isLoadingSynthesisTasks ? (
                                    <div className="flex items-center justify-center h-full p-24">
                                        <Spinner />
                                    </div>
                                ) : synthesisTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-14">
                                        <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                                        <span>No synthesis tasks yet</span>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {synthesisTasks.map((task) => (
                                            <div 
                                                key={task.task_id} 
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
                                                    selectedSynthesisResult?.task_id === task.task_id && "ring-2 ring-primary"
                                                )}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <code className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">
                                                            {task.task_id.slice(0, 8)}...
                                                        </code>
                                                        <Badge variant="outline" className="text-[9px] py-0">
                                                            {formatExecutionTime(task.execution_time_seconds)}
                                                        </Badge>
                                                        {task.model_used && (
                                                            <Badge variant="secondary" className="text-[8px] py-0 px-1">
                                                                {task.model_used.includes('claude') ? 'Claude' : task.model_used.slice(0, 12)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(task.timestamp)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7"
                                                        onClick={() => handleViewSynthesisResult(task.task_id)}
                                                        disabled={loadingResultId === task.task_id}
                                                    >
                                                        {loadingResultId === task.task_id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Eye className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => confirmDelete(task.task_id, 'synthesis')}
                                                        disabled={deletingTaskId === task.task_id}
                                                    >
                                                        {deletingTaskId === task.task_id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
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

            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Custom Instructions (Optional)
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                    <div className="space-y-2">
                        <Input 
                            placeholder="e.g., Focus on product features and pricing information..."
                            value={customInstruction}
                            onChange={(e) => setCustomInstruction(e.target.value)}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Add custom instructions to guide the extraction or synthesis agent's analysis.
                        </p>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {(selectedExtractionResult || selectedSynthesisResult) && (
                <div className="border rounded-xl p-6 bg-card">
                    {selectedExtractionResult && (
                        <WebExtractionResultViewer 
                            data={selectedExtractionResult}
                            onReRun={handleRunExtraction}
                            isReRunning={isRunningExtraction}
                        />
                    )}
                    {selectedSynthesisResult && (
                        <WebSynthesisResultViewer 
                            data={selectedSynthesisResult}
                            onReRun={handleRunSynthesis}
                            isReRunning={isRunningSynthesis}
                        />
                    )}
                </div>
            )}

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this {taskToDelete?.type} task? This action cannot be undone and all associated data will be permanently removed.
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
