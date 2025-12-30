
'use client'

import { useEffect, useState } from 'react';
import { AgentState, CorpusManifest, EvidenceLedger, GateOutputs } from '@/lib/brandos-v2.1/types';
import { pollPhase0StatusAction, startPhase0Action } from '@/server/brandos-v2.1/actions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, Loader2, PlayCircle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';

export default function Phase0Dashboard({ engagementId }: { engagementId: string }) {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentState[]>([]);
    const [ledger, setLedger] = useState<EvidenceLedger | null>(null);
    const [manifest, setManifest] = useState<CorpusManifest | null>(null);
    const [gateResults, setGateResults] = useState<GateOutputs | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        if (engagementId) {
            startPhase0Action(engagementId);
        }
    }, [engagementId]);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            const result = await pollPhase0StatusAction(engagementId);
            setAgents(result.agents);

            if (result.ledger) setLedger(result.ledger);
            if (result.manifest) setManifest(result.manifest);
            if (result.gateResults) setGateResults(result.gateResults);

            const allCompleted = result.agents.every(a => a.status === 'completed' || a.status === 'failed');
            if (allCompleted) {
                setIsPolling(false);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [engagementId, isPolling]);

    const gateStatus = gateResults?.overall_status || 'pending';
    const canProceed = gateStatus === 'pass' || gateStatus === 'warn';

    // DEV ONLY: Force status for demo
    const forceStatus = (status: 'pass' | 'warn' | 'fail') => {
        if (gateResults) {
            setGateResults({ ...gateResults, overall_status: status });
        }
    };

    const handleRetry = async () => {
        setIsPolling(true);
        setGateResults(null);
        // Reset other states if needed, though poll will overwrite
        await startPhase0Action(engagementId);
    };

    const handleEditConfig = () => {
        router.push(`/dashboard/brandos-v2.1/setup?engagementId=${engagementId}`);
    };

    return (
        <div>
            <DashboardLayoutHeading
                title="Phase 0: Outside-In Audit"
                subtitle="Collecting and cataloging raw evidence from open channels."
            />
            <div className="relative flex gap-3 mt-6">
                <div className="flex gap-1 mr-4 items-center bg-muted/50 p-1 rounded-lg">
                    <span className="text-xs px-2 text-muted-foreground font-mono">DEMO:</span>
                    <Button variant="ghost" size="sm" onClick={() => forceStatus('pass')} className="h-7 text-xs text-green-600">PASS</Button>
                    <Button variant="ghost" size="sm" onClick={() => forceStatus('warn')} className="h-7 text-xs text-yellow-600">WARN</Button>
                    <Button variant="ghost" size="sm" onClick={() => forceStatus('fail')} className="h-7 text-xs text-red-600">FAIL</Button>
                </div>
                <Button size="lg" disabled={!canProceed} onClick={() => router.push(`/dashboard/brandos-v2.1/phase-1?engagementId=${engagementId}`)}>
                    {canProceed ? 'Proceed to Phase 1' : 'Waiting for Data...'}
                    {canProceed && <PlayCircle className="ml-2 h-5 w-5" />}
                </Button>
            </div>

            {/* Agents Status */}
            <div className="space-y-6 mt-12">
                <h3 className="text-2xl font-medium">Agent Swarm Status</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {agents.map((agent) => (
                        <div key={agent.id} className="bg-muted/20 p-6 rounded-xl border space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-semibold">{agent.name}</span>
                                <StatusBadge status={agent.status} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Processing...</span>
                                    <span>{agent.progress}%</span>
                                </div>
                                <Progress value={agent.progress} className="h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {/* Gate 0 Logic */}
            {!isPolling && gateResults && (
                <div className="space-y-6 mt-5 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-medium">Gate 0: Corpus Adequacy</h3>
                    <GateResultDisplay
                        results={gateResults}
                        onRetry={handleRetry}
                        onEditConfig={handleEditConfig}
                    />
                </div>
            )}



            {/* Artifacts Viewer */}
            {(ledger || manifest) && (
                <div className="space-y-6 pt-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-medium">Generated Artifacts</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <Tabs defaultValue="manifest" className="w-full">
                        <TabsList className="bg-transparent justify-start gap-4 p-0">
                            <TabsTrigger value="gate" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-6 py-2 border">Gate Output</TabsTrigger>
                            <TabsTrigger value="manifest" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-6 py-2 border">Corpus Manifest</TabsTrigger>
                            <TabsTrigger value="ledger" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-6 py-2 border">Evidence Ledger</TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="gate">
                                <JsonViewer data={gateResults} title="gate_outputs.json" />
                            </TabsContent>
                            <TabsContent value="manifest">
                                {manifest && <ManifestVisualizer manifest={manifest} />}
                            </TabsContent>
                            <TabsContent value="ledger">
                                {ledger && <LedgerVisualizer ledger={ledger} />}
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

function GateResultDisplay({ results, onRetry, onEditConfig }: { results: GateOutputs, onRetry: () => void, onEditConfig: () => void }) {
    const isPass = results.overall_status === 'pass';
    const isWarn = results.overall_status === 'warn';
    const isFail = results.overall_status === 'fail';

    const colorClass = isPass ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-100 dark:border-green-900' :
        isWarn ? 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-100 dark:border-yellow-900' :
            'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/10 dark:text-red-100 dark:border-red-900';

    return (
        <div className={`p-8 rounded-xl border ${colorClass} space-y-4 transition-all duration-300`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {isPass ? <CheckCircle2 className="h-8 w-8" /> :
                        isWarn ? <AlertCircle className="h-8 w-8" /> :
                            <AlertCircle className="h-8 w-8" />}
                    <div>
                        <h4 className="text-xl font-bold uppercase tracking-tight">Status: {results.overall_status}</h4>
                        <p className="opacity-90">Gate evaluation complete.</p>
                    </div>
                </div>

                {/* Actions for Fail/Warn */}
                {!isPass && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="bg-background/50 border-current hover:bg-background/80"
                            onClick={onEditConfig}
                        >
                            Edit Configuration
                        </Button>
                        <Button
                            variant="default" // Use solid for primary action here
                            className={isFail ? "bg-red-600 hover:bg-red-700 text-white" : "bg-yellow-600 hover:bg-yellow-700 text-white"}
                            onClick={onRetry}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Retry Collection
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {results.gates.map((g, i) => (
                    <div key={i} className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 first:border-0 first:pt-0 first:mt-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-lg flex items-center gap-2">
                                    {g.name}
                                    {g.status !== 'pass' && <Badge variant="outline" className="text-xs uppercase bg-white/20 border-current">{g.status}</Badge>}
                                </p>
                                {/* Detailed failure guidance */}
                                {(g.status !== 'pass') && (
                                    <div className="text-sm opacity-90 font-medium mt-1">
                                        {g.status === 'fail' ? "Critical gaps found. Please adjust scope or extend timelines." : "Non-critical gaps found. You may proceed at risk."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {g.messages && g.messages.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {g.messages.map((m, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-current opacity-60" />
                                        <span>{m}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {g.affected_files && g.affected_files.length > 0 && (
                            <div className="mt-2 flex gap-2 items-center text-xs opacity-75">
                                <FileJson className="w-3 h-3" />
                                <span>Evidence:</span>
                                {g.affected_files.map(f => (
                                    <span key={f} className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">{f}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}



function ManifestVisualizer({ manifest }: { manifest: CorpusManifest }) {
    const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

    // Calculate global stats
    const websiteData = Object.values(manifest.coverage_summary.website || {});
    const totalWebpages = websiteData.reduce((acc, curr) => acc + (curr.pages_crawled || 0), 0);
    const totalImages = websiteData.reduce((acc, curr) => acc + (curr.total_images || 0), 0);

    let totalPosts = 0;
    let totalComments = 0;

    const socialData = manifest.coverage_summary.social || {};
    Object.values(socialData).forEach((entityChannels) => {
        Object.values(entityChannels).forEach((channelParams) => {
            totalPosts += channelParams.posts_collected || 0;
            totalComments += channelParams.comments_collected || 0;
        });
    });

    const entities = manifest.coverage_summary.entities_collected || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="flex items-center bg-muted rounded-lg p-1">
                    <Button
                        variant={viewMode === 'visual' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('visual')}
                        className="text-xs h-7"
                    >
                        Visual Dashboard
                    </Button>
                    <Button
                        variant={viewMode === 'json' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('json')}
                        className="text-xs h-7"
                    >
                        Raw JSON
                    </Button>
                </div>
            </div>

            {viewMode === 'visual' ? (
                <div className="space-y-8">
                    {/* Top Level Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-card border rounded-xl">
                            <div className="text-3xl font-bold">{totalWebpages}</div>
                            <div className="text-sm text-muted-foreground">Total Web Pages</div>
                        </div>
                        <div className="p-4 bg-card border rounded-xl">
                            <div className="text-3xl font-bold">{totalPosts}</div>
                            <div className="text-sm text-muted-foreground">Total Social Posts</div>
                        </div>
                        <div className="p-4 bg-card border rounded-xl">
                            <div className="text-3xl font-bold">{totalImages}</div>
                            <div className="text-sm text-muted-foreground">Total Images</div>
                        </div>
                        <div className="p-4 bg-card border rounded-xl">
                            <div className="text-3xl font-bold">{totalComments}</div>
                            <div className="text-sm text-muted-foreground">Total Comments</div>
                        </div>
                    </div>

                    {/* Entity Breakdown */}
                    <div className="bg-card border rounded-xl overflow-hidden">
                        <div className="bg-muted/30 p-4 border-b">
                            <h4 className="font-semibold">Coverage by Entity</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3">Entity</th>
                                        <th className="px-4 py-3">Website Pages</th>
                                        <th className="px-4 py-3">Social Posts</th>
                                        <th className="px-4 py-3">Website Status</th>
                                        <th className="px-4 py-3">Social Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {entities.map((entity) => {
                                        const webStats = manifest.coverage_summary.website?.[entity];
                                        const socialStats = manifest.coverage_summary.social?.[entity];

                                        // Calculate total social posts for this entity
                                        const entityPosts = socialStats ? Object.values(socialStats).reduce((acc, curr) => acc + (curr.posts_collected || 0), 0) : 0;

                                        // Determine aggregate social status safely
                                        const channels = socialStats ? Object.values(socialStats) : [];
                                        const hasPresence = channels.some(c => c.status === 'complete' || c.status === 'partial');
                                        const socialStatusLabel = hasPresence ? 'Active' : 'No Presence';

                                        return (
                                            <tr key={entity} className="hover:bg-muted/20">
                                                <td className="px-4 py-3 font-medium">{entity}</td>
                                                <td className="px-4 py-3">
                                                    {webStats?.pages_crawled || 0}
                                                    {webStats?.exclusion_breakdown && (
                                                        <span className="ml-2 text-xs text-muted-foreground" title="Excluded pages">
                                                            (-{Object.values(webStats.exclusion_breakdown).reduce((a, b) => a + b, 0)})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{entityPosts}</td>
                                                <td className="px-4 py-3">
                                                    {webStats?.status === 'complete' ? <Badge className="bg-green-600">COMPLETE</Badge> :
                                                        webStats?.status === 'partial' ? <Badge variant="secondary">PARTIAL</Badge> :
                                                            <Badge variant="outline">PENDING</Badge>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {socialStatusLabel === 'Active' ? <Badge className="bg-blue-600">ACTIVE</Badge> :
                                                        <Badge variant="secondary" className="opacity-70">LIMITED</Badge>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Gaps Section */}
                        {manifest.coverage_gaps && manifest.coverage_gaps.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-xl p-6">
                                <h4 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-400">Identified Gaps</h4>
                                <ul className="space-y-4">
                                    {manifest.coverage_gaps.map((gap, i) => (
                                        <li key={i} className="flex gap-3 items-start p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-red-100 dark:border-red-900/50">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-red-800 dark:text-red-300">{gap.entity} / {gap.channel}</span>
                                                    <Badge variant="outline" className={`
                                                        ${gap.severity === 'critical' ? 'border-red-500 text-red-600' :
                                                            gap.severity === 'significant' ? 'border-orange-500 text-orange-600' :
                                                                'border-yellow-500 text-yellow-600'} bg-transparent text-[10px] uppercase
                                                    `}>
                                                        {gap.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-red-700 dark:text-red-300">{gap.description}</p>
                                                <div className="text-xs mt-2 grid gap-1">
                                                    <span className="font-medium opacity-80">Impact: {gap.impact}</span>
                                                    <span className="font-medium opacity-80">Mitigation: {gap.mitigation}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Data Quality Flags */}
                        {manifest.data_quality_flags && manifest.data_quality_flags.length > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6">
                                <h4 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-400">Data Quality Flags</h4>
                                <ul className="space-y-4">
                                    {manifest.data_quality_flags.map((flag, i) => (
                                        <li key={i} className="flex gap-3 items-start p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                                            <FileJson className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-yellow-900 dark:text-yellow-200">{flag.entity} / {flag.channel}</span>
                                                </div>
                                                <p className="text-sm text-yellow-800 dark:text-yellow-300">{flag.issue}</p>
                                                <p className="text-xs text-yellow-700/80 dark:text-yellow-400/80">Handling: {flag.handling}</p>
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                    {flag.affected_metrics.map(m => (
                                                        <span key={m} className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded text-[10px] text-yellow-800 dark:text-yellow-300 font-mono">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <JsonViewer data={manifest} title="corpus_manifest.json" />
            )}
        </div>
    )
}

function LedgerVisualizer({ ledger }: { ledger: EvidenceLedger }) {
    const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
    const items = ledger.evidence || [];

    const renderSentiment = (metadata: any) => {
        if (!metadata?.sentiment?.polarity?.label) return <span className="text-muted-foreground">-</span>;

        const label = metadata.sentiment.polarity.label;
        const color = label.includes('positive') ? 'bg-green-100 text-green-700 border-green-200' :
            label.includes('negative') ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-gray-100 text-gray-700 border-gray-200';

        return <Badge variant="outline" className={`${color} capitalize border`}>{label.replace('_', ' ')}</Badge>;
    };

    const renderMetrics = (item: any) => {
        if (item.source_type === 'social_post' && item.metadata?.likes) {
            return <span className="text-xs font-mono">{item.metadata.likes} likes, {item.metadata.shares} shares</span>
        }
        if (item.source_type === 'image' && item.metadata?.visual_tags) {
            return <div className="flex flex-wrap gap-1 w-32">
                {item.metadata.visual_tags.slice(0, 2).map((t: string) => (
                    <span key={t} className="text-[10px] bg-muted px-1 rounded truncate max-w-full">{t}</span>
                ))}
                {item.metadata.visual_tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{item.metadata.visual_tags.length - 2}</span>}
            </div>
        }
        return <span className="text-muted-foreground">-</span>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="flex items-center bg-muted rounded-lg p-1">
                    <Button
                        variant={viewMode === 'visual' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('visual')}
                        className="text-xs h-7"
                    >
                        Table View
                    </Button>
                    <Button
                        variant={viewMode === 'json' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('json')}
                        className="text-xs h-7"
                    >
                        Raw JSON
                    </Button>
                </div>
            </div>

            {viewMode === 'visual' ? (
                <div className="border rounded-xl overflow-hidden">
                    <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                        <h4 className="font-semibold">Evidence Items ({ledger.evidence_count || items.length})</h4>
                        <span className="text-xs text-muted-foreground font-mono">{ledger.generated_at}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3">Sentiment</th>
                                    <th className="px-4 py-3">Content Excerpt</th>
                                    <th className="px-4 py-3">Metrics / Tags</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.slice(0, 15).map((item) => (
                                    <tr key={item.evidence_id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{item.source_entity}</div>
                                            <div className="text-xs text-muted-foreground capitalize flex gap-1 items-center">
                                                {item.source_channel} • {item.source_type.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {renderSentiment(item.metadata)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <div className="max-w-[300px] truncate" title={item.excerpt}>{item.excerpt || "No excerpt available"}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {renderMetrics(item)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{item.extraction_date ? new Date(item.extraction_date).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {items.length > 15 && (
                        <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t">
                            Showing top 15 of {items.length} items. Download JSON for full list.
                        </div>
                    )}
                </div>
            ) : (
                <JsonViewer data={ledger} title="evidence_ledger.json" />
            )}
        </div>
    )
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
