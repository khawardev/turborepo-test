'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    Terminal, Clock, Users, FileText, Calendar, Bot,
    Copy, CheckCircle2, Loader2, Trash2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownViewer } from "@/components/shared/MarkdownViewer";
import { toast } from "sonner";

interface SocialReportsResultViewerProps {
    data: any;
    onReRun?: () => void;
    isReRunning?: boolean;
}

export function SocialReportsResultViewer({ data, onReRun, isReRunning }: SocialReportsResultViewerProps) {
    if (!data) return null;

    const {
        social_report,
        entity_name,
        analysis_scope,
        batch_id,
        model_used,
        timestamp,
        execution_time_seconds,
        task_id
    } = data;

    const handleCopyReport = () => {
        if (social_report) {
            navigator.clipboard.writeText(social_report);
            toast.success("Report copied to clipboard");
        }
    };

    const formatExecutionTime = (seconds: number | string) => {
        const numSeconds = Number(seconds);
        if (!numSeconds || isNaN(numSeconds)) return 'N/A';
        if (numSeconds < 60) return `${numSeconds.toFixed(1)}s`;
        const minutes = Math.floor(numSeconds / 60);
        const remainingSeconds = numSeconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">
            <Card className="border-l-4 border-l-primary">
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Social Report
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <span>Analysis for:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {entity_name || 'Unknown Entity'}
                                    </Badge>
                                </CardDescription>
                            </div>
                            <Badge>
                                {analysis_scope || 'brand'}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap  justify-between items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex flex-wrap  items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                                <span className="flex items-center gap-1.5">
                                    <Bot className="w-3.5 h-3.5" />
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {model_used || 'Claude 4.5 Sonnet'}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatExecutionTime(execution_time_seconds)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}
                                </span>
                                {batch_id && (
                                    <span className="flex items-center gap-1.5">
                                        <code className="font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
                                            Batch: {batch_id.substring(0, 8)}...
                                        </code>
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap  items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                                <Button variant="outline" size="sm" onClick={handleCopyReport}>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Report
                                </Button>
                                {onReRun && (
                                    <Button variant="outline" size="sm" onClick={onReRun} disabled={isReRunning}>
                                        {isReRunning ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        )}
                                        Re-run Analysis
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Generated Social Report
                    </CardTitle>
                </CardHeader>
                <CardContent >
                    <ScrollArea className="h-[500px] w-full">
                        {social_report ? (
                            <MarkdownViewer content={social_report} />
                        ) : (
                            <p className="text-muted-foreground">No report content available.</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="mt-8 pt-4 border-t">
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors w-fit p-2 rounded-md hover:bg-muted/50">
                        <Terminal className="h-4 w-4" />
                        <span className="font-medium">View Raw JSON</span>
                    </summary>
                    <div className="mt-2 bg-muted/50 rounded-lg overflow-hidden border">
                        <ScrollArea className="h-[300px] w-full">
                            <div className="p-4">
                                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all text-muted-foreground">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </ScrollArea>
                    </div>
                </details>
            </div>
        </div>
    );
}

interface SocialReportsTaskListViewerProps {
    tasks: any[];
    onSelectTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    selectedTaskId?: string | null;
    isDeleting?: boolean;
    deletingTaskId?: string | null;
}

export function SocialReportsTaskListViewer({
    tasks,
    onSelectTask,
    onDeleteTask,
    selectedTaskId,
    isDeleting,
    deletingTaskId
}: SocialReportsTaskListViewerProps) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/5 border-dashed">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No Reports Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Run the Social Reports Agent to generate comprehensive reports from your social media data.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                    Previous Reports ({tasks.length})
                </h4>
            </div>
            <div className="grid gap-2">
                {tasks.map((task) => (
                    <div
                        key={task.task_id}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border bg-card cursor-pointer transition-all hover:bg-muted/30",
                            selectedTaskId === task.task_id && "border bg-primary/5"
                        )}
                        onClick={() => onSelectTask(task.task_id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-md">
                                <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {task.entity_name || 'Unknown Entity'}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-5 capitalize">
                                        {task.analysis_scope || 'brand'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {task.timestamp ? new Date(task.timestamp).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.execution_time_seconds ? `${Number(task.execution_time_seconds).toFixed(1)}s` : 'N/A'}
                                    </span>
                                    {task.scraped_urls_count !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {task.scraped_urls_count} URLs
                                        </span>
                                    )}
                                    {task.model_used && (
                                        <span className="flex items-center gap-1">
                                            <Bot className="w-3 h-3" />
                                            {task.model_used}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedTaskId === task.task_id && (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.task_id);
                                }}
                                disabled={isDeleting && deletingTaskId === task.task_id}
                            >
                                {isDeleting && deletingTaskId === task.task_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
