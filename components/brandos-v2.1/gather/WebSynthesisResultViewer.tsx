'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, FileText, Clock, Terminal, Cpu, Sparkles, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { MarkdownViewer } from "@/components/shared/MarkdownViewer";
import { toast } from 'sonner';

type WebSynthesisResultViewerProps = {
    data: any;
    onReRun?: () => void;
    isReRunning?: boolean;
}

export function WebSynthesisResultViewer({ data, onReRun, isReRunning = false }: WebSynthesisResultViewerProps) {
    if (!data) return null;
    
    const synthesisReport = data.synthesis_report || '';
    const executionTimeValue = typeof data.execution_time_seconds === 'number' && !isNaN(data.execution_time_seconds) 
        ? data.execution_time_seconds.toFixed(2) 
        : 'N/A';
    const metadata = {
        taskId: data.task_id || 'N/A',
        clientId: data.client_id || 'N/A',
        brandId: data.brand_id || 'N/A',
        batchId: data.batch_id || 'N/A',
        modelUsed: data.model_used || 'Claude 4.5 Sonnet',
        timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A',
        executionTime: executionTimeValue !== 'N/A' ? `${executionTimeValue}s` : 'N/A',
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden animate-in fade-in duration-500">
            <div className="flex justify-between items-center pb-2 border-b">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Web Synthesis Report
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive analysis completed • {metadata.timestamp}
                    </p>
                </div>
                {onReRun && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onReRun} 
                        disabled={isReRunning}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", isReRunning && "animate-spin")} />
                        {isReRunning ? "Running..." : "Re-run Synthesis"}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Cpu className="h-3.5 w-3.5" /> Model
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="text-sm font-medium truncate">{metadata.modelUsed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" /> Execution Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="text-2xl font-bold">{metadata.executionTime}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" /> Batch ID
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="text-xs font-mono truncate">{metadata.batchId}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="pb-0 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        Synthesis Report
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs"
                        onClick={() => {
                            navigator.clipboard.writeText(synthesisReport);
                            toast.success('Synthesis report copied to clipboard!');
                        }}
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy 
                    </Button>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-muted/20">
                        <div className="prose dark:prose-invert max-w-none">
                            <MarkdownViewer content={synthesisReport} />
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="pt-4 border-t">
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
