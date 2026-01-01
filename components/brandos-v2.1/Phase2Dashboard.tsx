
'use client'

import { useEffect, useState } from 'react';
import { AgentState, BrandPlatform, BrandArchetype, ReportArtifact, GateOutputs, FactBase, BrandNarrative, BrandVoice, ContentStrategy, InternalConsistency, VoiceOfMarket, VisualIdentity } from '@/lib/brandos-v2.1/types';
import { pollPhase2StatusAction, startPhase2Action } from '@/server/brandos-v2.1/actions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MdOutlineArrowRight } from "react-icons/md";
import { FileText } from 'lucide-react';
import { ButtonSpinner } from '@/components/shared/SpinnerLoader';
import { useRouter } from 'next/navigation';
import { DashboardInnerLayout, GateResultDisplay, JsonViewer } from './shared/DashboardComponents';
import { AgentList } from './shared/AgentList';
import { DeliverablesTable, DeliverableItem } from './shared/DeliverablesTable';

const STRATEGY_DELIVERABLES: DeliverableItem[] = [
    { name: 'Fact Base', filename: '{entity}_fact_base.json', schema: 'fact_base.json', owner: 'OI-10' },
    { name: 'Brand Platform', filename: '{entity}_brand_platform.json', schema: 'brand_platform.json', owner: 'OI-11' },
    { name: 'Brand Archetype', filename: '{entity}_brand_archetype.json', schema: 'brand_archetype.json', owner: 'OI-11' },
    { name: 'Brand Narrative', filename: '{entity}_brand_narrative.json', schema: 'brand_narrative.json', owner: 'OI-11' },
    { name: 'Brand Voice', filename: '{entity}_brand_voice.json', schema: 'brand_voice.json', owner: 'OI-11' },
    { name: 'Content Strategy', filename: '{entity}_content_strategy.json', schema: 'content_strategy.json', owner: 'OI-12' },
    { name: 'Internal Consistency', filename: '{entity}_internal_consistency.json', schema: 'internal_consistency.json', owner: 'OI-14' },
    { name: 'Voice of Market', filename: '{entity}_voice_of_market.json', schema: 'voice_of_market.json', owner: 'OI-15' },
    { name: 'Visual Identity', filename: '{entity}_visual_identity.json', schema: 'visual_identity.json', owner: 'OI-16' },
];

const REPORT_DELIVERABLES: DeliverableItem[] = [
    { name: 'Emergent Brand Report', filename: '{entity}_emergent_brand_report.md', schema: 'N/A', owner: 'RPT-01' },
    { name: 'Social Channel Audit', filename: '{entity}_{channel}_audit_report.md', schema: 'N/A', owner: 'RPT-02' },
    { name: 'Competitive Landscape Report', filename: 'competitive_landscape_report.md', schema: 'N/A', owner: 'RPT-03' },
    { name: 'Consistency Report', filename: 'consistency_report.md', schema: 'N/A', owner: 'RPT-04' },
    { name: 'Voice of Market Report', filename: 'voice_of_market_report.md', schema: 'N/A', owner: 'RPT-05' },
    { name: 'Visual Identity Report', filename: 'visual_identity_report.md', schema: 'N/A', owner: 'RPT-06' },
    { name: 'Visual Competitive Report', filename: 'visual_competitive_report.md', schema: 'N/A', owner: 'RPT-07' },
];

export default function Phase2Dashboard({ engagementId }: { engagementId: string }) {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentState[]>([]);
    const [synthesis, setSynthesis] = useState<{
        fact_base: FactBase;
        platform: BrandPlatform;
        archetype: BrandArchetype;
        brand_narrative: BrandNarrative;
        brand_voice: BrandVoice;
        content_strategy: ContentStrategy;
        internal_consistency: InternalConsistency;
        voice_of_market: VoiceOfMarket;
        visual_identity: VisualIdentity;
    } | undefined>(undefined);
    const [reports, setReports] = useState<ReportArtifact[] | undefined>(undefined);
    const [gate3Results, setGate3Results] = useState<GateOutputs | undefined>(undefined);
    const [gate4Results, setGate4Results] = useState<GateOutputs | undefined>(undefined);
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
            if (allCompleted) setIsPolling(false);
        }, 2000);

        return () => clearInterval(interval);
    }, [engagementId, isPolling]);

    const overallStatus = (gate4Results?.overall_status === 'pass' || gate4Results?.overall_status === 'warn') ? 'complete' : 'pending';
    const canProceed = overallStatus === 'complete';

    return (
        <DashboardInnerLayout>
            {/* Agents */}
            <div className="space-y-6 ">
                <div className="border-b pb-2 flex justify-between">
                    <div>
                        <h3 className="text-2xl font-medium tracking-tight">Agent Swarm Status</h3>
                        <p className="text-muted-foreground mt-1">Real-time status of strategy and reporting agents.</p>
                    </div>
                    <Button disabled={!canProceed} onClick={() => router.push(`/dashboard/brandos-v2.1/comparative?engagementId=${engagementId}`)} >
                        {canProceed ? (
                            <>
                                Proceed to Comparative Analysis
                                <MdOutlineArrowRight />
                            </>
                        ) : (
                            <ButtonSpinner>Processing Phase 2</ButtonSpinner>
                        )}
                    </Button>
                </div>
                <AgentList agents={agents} />
            </div>

            {/* Gate 3 */}
            {gate3Results && (
                <div className="space-y-6 mt-10 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-medium tracking-tight">Gate 3: Synthesis Credibility</h3>
                    <GateResultDisplay results={gate3Results} />
                </div>
            )}

            {/* Gate 4 */}
            {gate4Results && (
                <div className="space-y-6 mt-10 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-medium tracking-tight">Gate 4: Report Quality</h3>
                    <GateResultDisplay results={gate4Results} />
                </div>
            )}

            {/* Artifacts */}
            {(synthesis || reports) && (
                <div className="space-y-8 pt-12">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-medium tracking-tight">Phase 2 Deliverables</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <Tabs defaultValue="strategy" className="w-full">
                        <TabsList >
                            <TabsTrigger
                                value="strategy"
                            >
                                Phase 2A: Entity Strategy Outputs
                            </TabsTrigger>
                            <TabsTrigger
                                value="reports"

                            >
                                Report Deliverables
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="strategy" className="space-y-6">
                                <DeliverablesTable items={STRATEGY_DELIVERABLES} />
                                <div className="grid md:grid-cols-2 gap-6 pt-4">
                                    <JsonViewer data={synthesis?.fact_base} title="fact_base.json" />
                                    <JsonViewer data={synthesis?.platform} title="brand_platform.json" />
                                    <JsonViewer data={synthesis?.archetype} title="brand_archetype.json" />
                                    <JsonViewer data={synthesis?.brand_voice} title="brand_voice.json" />
                                    <JsonViewer data={synthesis?.brand_narrative} title="brand_narrative.json" />
                                    <JsonViewer data={synthesis?.content_strategy} title="content_strategy.json" />
                                    <JsonViewer data={synthesis?.internal_consistency} title="internal_consistency.json" />
                                    <JsonViewer data={synthesis?.voice_of_market} title="voice_of_market.json" />
                                    <JsonViewer data={synthesis?.visual_identity} title="visual_identity.json" />
                                </div>
                            </TabsContent>
                            <TabsContent value="reports" className="space-y-6">
                                <DeliverablesTable items={REPORT_DELIVERABLES} />
                                <div className="grid gap-6 pt-4">
                                    {reports?.map((rpt, i) => (
                                        <div key={i} className="p-6 rounded-xl border bg-muted/10 space-y-4  transition-all">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-6 h-6 " />
                                                <div>
                                                    <h4 className="font-semibold">{rpt.report_type}</h4>
                                                    <p className="text-xs text-muted-foreground">{rpt.entity} • Generator: {REPORT_DELIVERABLES.find(d => d.name === rpt.report_type)?.owner || 'RPT-XX'}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-background rounded-lg text-sm font-mono whitespace-pre-wrap h-64 overflow-auto border shadow-inner">
                                                {rpt.markdown_content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            )}
        </DashboardInnerLayout>
    );
}
