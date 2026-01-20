'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, FileText, Clock, Terminal, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

type WebExtractionResultViewerProps = {
    data: any;
    onReRun?: () => void;
    isReRunning?: boolean;
}

export function WebExtractionResultViewer({ data, onReRun, isReRunning = false }: WebExtractionResultViewerProps) {
    if (!data) return null;
    
    const extractionOutput = data.extraction_output || '';
    const executionTimeValue = typeof data.execution_time_seconds === 'number' && !isNaN(data.execution_time_seconds) 
        ? data.execution_time_seconds.toFixed(2) 
        : 'N/A';
    const metadata = {
        taskId: data.task_id || 'N/A',
        clientId: data.client_id || 'N/A',
        brandId: data.brand_id || 'N/A',
        batchId: data.batch_id || 'N/A',
        scrapedUrlsCount: data.scraped_urls_count ?? 0,
        modelUsed: data.model_used || 'Claude 4.5 Sonnet',
        timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A',
        executionTime: executionTimeValue !== 'N/A' ? `${executionTimeValue}s` : 'N/A',
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden animate-in fade-in duration-500">
            <div className="flex justify-between items-center pb-2 border-b">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Web Extraction Complete
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Extracted structured data from {metadata.scrapedUrlsCount} URLs • {metadata.timestamp}
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
                        {isReRunning ? "Running..." : "Re-run Extraction"}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" /> URLs Processed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="text-2xl font-bold">{metadata.scrapedUrlsCount}</div>
                    </CardContent>
                </Card>
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
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Extraction Output
                    </CardTitle>
                </CardHeader>
                <CardContent >
                    <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted/20">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{extractionOutput}</ReactMarkdown>
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
