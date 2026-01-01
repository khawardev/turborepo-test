
'use client'

import { useEffect, useState } from 'react';
import { AgentState, BrandPlatform, BrandArchetype, ReportArtifact, GateOutputs } from '@/lib/brandos-v2.1/types';
import { pollPhase2StatusAction, startPhase2Action } from '@/server/brandos-v2.1/actions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, Loader2, FileJson, Download, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area"
import { BRAND_OS_AGENTS } from '@/lib/brandos-v2.1/agent-metadata';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileInput, FileOutput, ChevronDown } from 'lucide-react';

// --- COMPONENTS ---

function ConfidenceBadge({ score }: { score: number }) {
    let color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    let icon = <AlertCircle className="w-3 h-3 mr-1" />;
    
    if (score >= 0.8) {
        color = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
    } else if (score >= 0.6) {
        color = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
        icon = <Clock className="w-3 h-3 mr-1" />; // Warn icon alternative
    }

    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", color)}>
            {icon}
            {(score * 100).toFixed(0)}% Confidence
        </span>
    );
}

function ThemeBar({ name, score, colorClass = "bg-blue-600" }: { name: string, score: number, colorClass?: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">{(score * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                    className={cn("h-full rounded-full transition-all duration-500", colorClass)} 
                    style={{ width: `${score * 100}%` }} 
                />
            </div>
        </div>
    );
}

// --- MAIN DASHBOARD ---

export default function Phase2Dashboard({ engagementId }: { engagementId: string }) {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentState[]>([]);
    const [synthesis, setSynthesis] = useState<{ platform: BrandPlatform, archetype: BrandArchetype } | null>(null);
    const [reports, setReports] = useState<ReportArtifact[] | null>(null);
    const [gate3Results, setGate3Results] = useState<GateOutputs | null>(null);
    const [gate4Results, setGate4Results] = useState<GateOutputs | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        if (engagementId) {
            startPhase2Action(engagementId);
        }
    }, [engagementId]);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            const result = await pollPhase2StatusAction(engagementId);
            setAgents(result.agents);

            if (result.synthesis) setSynthesis(result.synthesis);
            if (result.reports) setReports(result.reports);
            if (result.gate3Results) setGate3Results(result.gate3Results);
            if (result.gate4Results) setGate4Results(result.gate4Results);

            const allCompleted = result.agents.every(a => a.status === 'completed' || a.status === 'failed');
            if (allCompleted) {
                setIsPolling(false);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [engagementId, isPolling]);

    const hasSynthesis = !!synthesis;
    const overallStatus = (gate4Results?.overall_status === 'pass' || gate4Results?.overall_status === 'warn') ? 'complete' : 'pending';

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6">
            <DashboardLayoutHeading
                title="Phase 2: Synthesis & Reporting"
                subtitle="Artificial Intelligence layer synthesizing core brand strategy and reports."
            />
            
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b pb-6">
                <div className="space-y-1">
                     <h3 className="text-lg font-medium">Generation Status</h3>
                     <p className="text-sm text-muted-foreground">{overallStatus === 'complete' ? "All artifacts generated and validated." : "Agents are analyzing the corpus..."}</p>
                </div>
                
                 {overallStatus === 'complete' && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/dashboard/brandos-v2.1/comparative?engagementId=${engagementId}`)}>
                            View Comparative (Flow E)
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90" onClick={() => router.push(`/dashboard/brandos-v2.1/export?engagementId=${engagementId}`)}>
                            Proceed to Export (Flow F) <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Agent Status & Gates */}
                <div className="lg:col-span-4 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Swarm Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {agents.map((agent) => {
                                const metadata = BRAND_OS_AGENTS[agent.id.toLowerCase()];
                                return (
                                    <Collapsible key={agent.id} className="group bg-muted/20 p-3 rounded-lg border transition-all hover:bg-muted/30">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="p-0 h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground">
                                                            <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <div>
                                                        <span className="font-semibold text-sm block leading-none">{agent.name}</span>
                                                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1 block">{metadata?.role}</span>
                                                    </div>
                                                </div>
                                                <StatusBadge status={agent.status} />
                                            </div>

                                            <div className="pl-7 space-y-1">
                                                <Progress value={agent.progress} className="h-1.5" />
                                            </div>

                                            <CollapsibleContent className="pl-7 space-y-3 pt-1">
                                                {metadata && (
                                                    <div className="text-xs space-y-3 animate-in slide-in-from-top-1">
                                                        <p className="text-muted-foreground leading-snug">
                                                            {metadata.description}
                                                        </p>
                                                        
                                                        <div className="space-y-2 bg-background/50 p-2 rounded border">
                                                            <div>
                                                                <span className="flex items-center gap-1.5 font-semibold text-[10px] uppercase text-blue-600 dark:text-blue-400 mb-1">
                                                                    <FileInput className="w-3 h-3" /> Input
                                                                </span>
                                                                <ul className="space-y-0.5">
                                                                    {metadata.inputs.map((input, i) => (
                                                                        <li key={i} className="text-[10px] text-muted-foreground truncate hover:text-foreground transition-colors" title={input}>
                                                                            • {input}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="pt-2 border-t border-dashed">
                                                                <span className="flex items-center gap-1.5 font-semibold text-[10px] uppercase text-green-600 dark:text-green-400 mb-1">
                                                                    <FileOutput className="w-3 h-3" /> Output
                                                                </span>
                                                                <ul className="space-y-0.5">
                                                                    {metadata.outputs.map((output, i) => (
                                                                        <li key={i} className="text-[10px] text-muted-foreground truncate hover:text-foreground transition-colors" title={output}>
                                                                            • {output}
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
                        </CardContent>
                    </Card>

                    {gate3Results && <GateCard title="Gate 3: Synthesis Credibility" results={gate3Results} />}
                    {gate4Results && <GateCard title="Gate 4: Report Quality" results={gate4Results} />}
                </div>

                {/* RIGHT COLUMN: Synthesis View */}
                <div className="lg:col-span-8 space-y-6">
                    {!hasSynthesis ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p>Waiting for The Archaeologist (OI-11)...</p>
                        </div>
                    ) : (
                        <Tabs defaultValue="emergent" className="w-full">
                            <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b gap-6">
                                <TabsTrigger value="emergent" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 font-semibold text-base">Emergent Brand</TabsTrigger>
                                <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 font-semibold text-base">Generated Reports</TabsTrigger>
                                <TabsTrigger value="raw" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 font-semibold text-base">Raw JSON</TabsTrigger>
                            </TabsList>

                            {/* View 1: Emergent Brand (Visual) */}
                            <TabsContent value="emergent" className="space-y-6 mt-6 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Brand Platform Card */}
                                    <Card className="md:col-span-2 border-l-4 border-l-blue-500">
                                        <CardHeader>
                                            <CardTitle>Brand Platform</CardTitle>
                                            <CardDescription>Synthesized core identity elements from extracted evidence.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Mission</span>
                                                        <ConfidenceBadge score={synthesis?.platform.mission.confidence || 0} />
                                                    </div>
                                                    <p className="text-lg font-medium leading-relaxed">"{synthesis?.platform.mission.synthesized}"</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Vision</span>
                                                        <ConfidenceBadge score={synthesis?.platform.vision.confidence || 0} />
                                                    </div>
                                                    <p className="text-lg font-medium leading-relaxed">"{synthesis?.platform.vision.synthesized}"</p>
                                                </div>
                                                <div className="space-y-1">
                                                     <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Positioning</span>
                                                        <ConfidenceBadge score={synthesis?.platform.positioning.confidence || 0} />
                                                    </div>
                                                    <p className="text-lg font-medium leading-relaxed text-blue-700 dark:text-blue-300">"{synthesis?.platform.positioning.synthesized}"</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                                                <h4 className="font-semibold text-sm uppercase text-muted-foreground">Core Values</h4>
                                                <div className="space-y-3">
                                                    {synthesis?.platform.values.synthesized.map((val, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1 p-2 hover:bg-muted/50 rounded transition-colors">
                                                            <div className="flex justify-between">
                                                                <span className="font-bold">{val.value}</span>
                                                                <span className="text-xs text-muted-foreground">Id: {(val as any).evidence_ids?.[0] || 'N/A'}</span>
                                                            </div>
                                                            <span className="text-sm text-muted-foreground">{val.description}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Archetype & Themes */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Archetype</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {synthesis?.archetype && (
                                                <div className="text-center p-6 bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/30 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center border-4 border-double border-indigo-200">
                                                    <span className="text-sm uppercase tracking-widest text-indigo-500">Primary</span>
                                                    <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{synthesis.archetype.primary_archetype.name}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">{(synthesis.archetype.primary_archetype.score * 100).toFixed(0)}% Match</span>
                                                </div>
                                            )}
                                            <div className="px-4 py-2 bg-muted rounded-lg text-center text-sm">
                                                <span className="font-semibold block text-muted-foreground text-xs uppercase mb-1">Secondary</span>
                                                {synthesis?.archetype.secondary_archetype.name} ({(synthesis!.archetype.secondary_archetype.score * 100).toFixed(0)}%)
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Dominant Themes</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-5">
                                            {synthesis?.platform.key_themes?.map((theme, i) => (
                                                <ThemeBar 
                                                    key={i} 
                                                    name={theme.name} 
                                                    score={theme.score} 
                                                    colorClass={i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : "bg-blue-400"} 
                                                />
                                            ))}
                                            <div className="pt-4 text-xs text-muted-foreground text-center">
                                                *Extracted from semantic clusters across 24 sources
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* View 2: Reports */}
                            <TabsContent value="reports" className="mt-6">
                                <ScrollArea className="h-[600px] pr-4">
                                     <div className="space-y-6">
                                        {reports?.map((rpt, i) => (
                                            <div key={i} className="border rounded-xl p-6 bg-card shadow-sm">
                                                <div className="flex items-center justify-between mb-4 border-b pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold">{rpt.report_type}</h4>
                                                            <p className="text-xs text-muted-foreground">{new Date(rpt.generated_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">Download PDF</Button>
                                                </div>
                                                <div className="prose dark:prose-invert max-w-none text-sm bg-muted/30 p-6 rounded-lg border">
                                                    <pre className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed">{rpt.markdown_content}</pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            {/* View 3: JSON */}
                            <TabsContent value="raw" className="mt-6">
                                 <div className="grid md:grid-cols-2 gap-6">
                                    <JsonViewer data={synthesis?.platform} title="brand_platform.json" />
                                    <JsonViewer data={synthesis?.archetype} title="brand_archetype.json" />
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENTS ---

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'running': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running</span>;
        case 'completed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</span>;
        case 'failed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"><AlertCircle className="w-3 h-3 mr-1" /> Failed</span>;
        default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"><Clock className="w-3 h-3 mr-1" /> Idle</span>;
    }
}

function GateCard({ title, results }: { title: string, results: GateOutputs }) {
    const isPass = results.overall_status === 'pass';
    const isWarn = results.overall_status === 'warn';
    const colorClass = isPass ? 'border-green-200 bg-green-50 dark:bg-green-900/10' :
        isWarn ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' :
            'border-red-200 bg-red-50 dark:bg-red-900/10';

    return (
        <Card className={cn("border-l-4", colorClass.replace('bg-', 'border-l-'))}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <Badge variant={isPass ? "default" : isWarn ? "secondary" : "destructive"}>{results.overall_status.toUpperCase()}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {results.gates.map((g, i) => (
                        <div key={i} className="text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium">{g.name}</span>
                                {g.status !== 'pass' && <span className="text-xs text-red-500 font-bold">{g.status.toUpperCase()}</span>}
                            </div>
                            {g.messages?.map((m, idx) => (
                                <p key={idx} className="text-muted-foreground text-xs flex gap-2">
                                    <span className="block mt-1 w-1 h-1 rounded-full bg-current" />
                                    {m}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function JsonViewer({ data, title }: { data: any, title: string }) {
    return (
        <div className="relative group">
            <div className="absolute top-3 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded border z-10">
                <FileJson className="w-3 h-3" />
                {title}
            </div>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-xl overflow-auto max-h-[400px] border shadow-sm text-xs font-mono">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    )
}
