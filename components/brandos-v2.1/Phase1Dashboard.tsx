
'use client'

import { useEffect, useState } from 'react';
import { AgentState, UrlExtraction, PostExtraction, WebsiteVerbalBedrock, SocialChannelBedrock, GateOutputs } from '@/lib/brandos-v2.1/types';
import { pollPhase1StatusAction, startPhase1Action } from '@/server/brandos-v2.1/actions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, Loader2, PlayCircle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';
import { BRAND_OS_AGENTS } from '@/lib/brandos-v2.1/agent-metadata';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileInput, FileOutput } from 'lucide-react';

export default function Phase1Dashboard({ engagementId }: { engagementId: string }) {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentState[]>([]);
    const [extractions, setExtractions] = useState<{ url: UrlExtraction[], posts: PostExtraction[] } | null>(null);
    const [bedrocks, setBedrocks] = useState<{ website: WebsiteVerbalBedrock, social: SocialChannelBedrock } | null>(null);
    const [gate1Results, setGate1Results] = useState<GateOutputs | null>(null);
    const [gate2Results, setGate2Results] = useState<GateOutputs | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        if (engagementId) {
            startPhase1Action(engagementId);
        }
    }, [engagementId]);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            const result = await pollPhase1StatusAction(engagementId);
            setAgents(result.agents);

            if (result.extractions) setExtractions(result.extractions);
            if (result.bedrocks) setBedrocks(result.bedrocks);
            if (result.gate1Results) setGate1Results(result.gate1Results);
            if (result.gate2Results) setGate2Results(result.gate2Results);

            const allCompleted = result.agents.every(a => a.status === 'completed' || a.status === 'failed');
            if (allCompleted) {
                setIsPolling(false);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [engagementId, isPolling]);

    const overallStatus = (gate2Results?.overall_status === 'pass' || gate2Results?.overall_status === 'warn') ? 'complete' : 'pending';
    const canProceed = overallStatus === 'complete';

    return (
        <div>
            <DashboardLayoutHeading
                title="Phase 1: Extraction & Compilation"
                subtitle="Extracting structured data and compiling bedrocks."
            />
            <div className="relative flex gap-3 mt-6">
                 <Button size="lg" disabled={!canProceed} onClick={() => router.push(`/dashboard/brandos-v2.1/phase-2?engagementId=${engagementId}`)}>
                    {canProceed ? 'Proceed to Phase 2' : 'Processing Phase 1...'}
                    {canProceed && <PlayCircle className="ml-2 h-5 w-5" />}
                </Button>
            </div>

            {/* Agents Status */}
            <div className="space-y-6 mt-12">
                <h3 className="text-2xl font-medium">Agent Swarm Status</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {agents.map((agent) => {
                        const metadata = BRAND_OS_AGENTS[agent.id.toLowerCase()];
                        return (
                            <Collapsible key={agent.id} className="group bg-muted/20 p-4 rounded-xl border transition-all hover:bg-muted/30">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                         <div className="flex items-center gap-3">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground">
                                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-semibold leading-none">{agent.name}</span>
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground mt-1 block">{metadata?.role}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={agent.status} />
                                    </div>
                                    
                                    <div className="space-y-1.5 pl-9">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{agent.progress}%</span>
                                        </div>
                                        <Progress value={agent.progress} className="h-2" />
                                    </div>

                                    <CollapsibleContent className="pl-9 space-y-4 pt-2">
                                        {metadata && (
                                            <div className="text-sm space-y-4 animate-in slide-in-from-top-2">
                                                <p className="text-muted-foreground leading-relaxed">
                                                    {metadata.description}
                                                </p>
                                                <div className="grid grid-cols-1 gap-3 p-3 bg-background/50 rounded-lg border">
                                                    <div className="space-y-1.5">
                                                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                            <FileInput className="w-3 h-3" /> Inputs
                                                        </span>
                                                        <ul className="grid gap-1">
                                                            {metadata.inputs.map((input, i) => (
                                                                <li key={i} className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border truncate" title={input}>
                                                                    {input}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="space-y-1.5 pt-2 border-t">
                                                         <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                                                            <FileOutput className="w-3 h-3" /> Outputs
                                                        </span>
                                                        <ul className="grid gap-1">
                                                            {metadata.outputs.map((output, i) => (
                                                                <li key={i} className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border truncate" title={output}>
                                                                    {output}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        );
                    })}
                </div>
            </div>

            {/* Gate 1 Logic */}
            {gate1Results && (
                <div className="space-y-6 mt-5 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-medium">Gate 1: Extraction Quality</h3>
                    <GateResultDisplay results={gate1Results} />
                </div>
            )}
            
            {/* Gate 2 Logic */}
            {gate2Results && (
                <div className="space-y-6 mt-5 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-medium">Gate 2: Compilation Integrity</h3>
                     <GateResultDisplay results={gate2Results} />
                </div>
            )}

            {/* Artifacts Viewer */}
            {(extractions || bedrocks) && (
                <div className="space-y-6 pt-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-medium">Generated Artifacts</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <Tabs defaultValue="bedrocks" className="w-full">
                        <TabsList className="bg-transparent justify-start gap-4 p-0">
                            <TabsTrigger value="extractions" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-6 py-2 border">Extractions</TabsTrigger>
                            <TabsTrigger value="bedrocks" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-6 py-2 border">Bedrocks</TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                             <TabsContent value="extractions">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <JsonViewer data={extractions?.url} title="url_extractions_sample.json" />
                                </div>
                            </TabsContent>
                            <TabsContent value="bedrocks">
                                <div className="grid md:grid-cols-2 gap-6">
                                     <JsonViewer data={bedrocks?.website} title="website_verbal_bedrock.json" />
                                     <JsonViewer data={bedrocks?.social} title="social_channel_bedrock.json" />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'running': return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running</span>;
        case 'completed': return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"><CheckCircle2 className="w-4 h-4 mr-2" /> Completed</span>;
        case 'failed': return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"><AlertCircle className="w-4 h-4 mr-2" /> Failed</span>;
        default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"><Clock className="w-4 h-4 mr-2" /> Pending</span>;
    }
}

function GateResultDisplay({ results }: { results: GateOutputs }) {
    const isPass = results.overall_status === 'pass';
    const isWarn = results.overall_status === 'warn';
    const colorClass = isPass ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-100 dark:border-green-900' :
        isWarn ? 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-100 dark:border-yellow-900' :
            'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/10 dark:text-red-100 dark:border-red-900';

    return (
        <div className={`p-8 rounded-xl border ${colorClass} space-y-4`}>
             <div className="flex items-center gap-4">
                {isPass ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                <div>
                    <h4 className="text-xl font-bold uppercase tracking-tight">Status: {results.overall_status}</h4>
                </div>
            </div>
             <div className="space-y-4">
                {results.gates.map((g, i) => (
                    <div key={i} className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 first:border-0 first:pt-0 first:mt-2">
                        <p className="font-semibold text-lg flex items-center gap-2">
                            {g.name}
                            {g.status !== 'pass' && <Badge variant="outline" className="text-xs uppercase bg-white/20 border-current">{g.status}</Badge>}
                        </p>
                        {g.messages && (
                            <ul className="mt-2 space-y-1">
                                {g.messages.map((m, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-current opacity-60" />
                                        <span>{m}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function JsonViewer({ data, title }: { data: any, title: string }) {
    return (
        <div className="relative group">
            <div className="absolute top-3 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded border">
                <FileJson className="w-3 h-3" />
                {title}
            </div>
            <div className="bg-slate-950 text-slate-50 p-6 rounded-xl overflow-auto max-h-[600px] border shadow-sm">
                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    )
}
