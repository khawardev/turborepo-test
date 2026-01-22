'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Terminal, Bot, Database, FileText } from 'lucide-react';
import { SimpleWebsiteScrapViewer, SimpleSocialScrapViewer } from '../ResultsViewers';
import BrandProfile from '@/components/stages/ccba/details/profile-tab/BrandProfile';
import { AuditorAgentCard } from '../AuditorAgentCard';
import { AuditorResultViewer } from '../AuditorResultViewer';
import { SocialAuditorResultViewer } from '../SocialAuditorResultViewer';
import { SocialReportsResultViewer, SocialReportsTaskListViewer } from '../SocialReportsResultViewer';
import { useAuditor } from './hooks/UseAuditor';
import { useSocialAuditor } from './hooks/UseSocialAuditor';
import { AiOutlinePieChart } from "react-icons/ai";
import { RecollectDialog } from '../RecollectDialog';
import { WebAgentsManager } from '../WebAgentsManager';
import {
    runSocialReportsAgent,
    getSocialReportsOutput,
    listSocialReportsTasks,
    deleteSocialReportsTask,
    type SocialChannelName,
    type AnalysisScope
} from '@/server/actions/socialReportsActions';

type DataViewManagerProps = {
    brandId: string;
    brandData: any;
    websiteBatchId: string | null;
    socialBatchId: string | null;
    websiteBatchStatus: string | null;
    socialBatchStatus: string | null;
    websiteSlot: React.ReactNode;
    socialSlot: React.ReactNode;
    availableChannels: string[];
    hasResults: boolean;
    isWebComplete: boolean;
    isSocialComplete: boolean;
};

export function DataViewManager({
    brandId,
    brandData,
    websiteBatchId,
    socialBatchId,
    websiteBatchStatus,
    socialBatchStatus,
    websiteSlot,
    socialSlot,
    availableChannels,
    hasResults,
    isWebComplete,
    isSocialComplete
}: DataViewManagerProps) {
    const [activeTab, setActiveTab] = useState('brand_profile');
    const [websiteAuditScope, setWebsiteAuditScope] = useState<string>('both');
    const [websiteAuditModel, setWebsiteAuditModel] = useState<string>('claude-4.5-sonnet');
    const [socialAuditScope, setSocialAuditScope] = useState<string>('brand');
    const [selectedChannel, setSelectedChannel] = useState<string>('linkedin');

    const [socialReportsTaskId, setSocialReportsTaskId] = useState<string | null>(null);
    const [socialReportsResult, setSocialReportsResult] = useState<any>(null);
    const [isSocialReportsRunning, setIsSocialReportsRunning] = useState(false);
    const [socialReportsChannel, setSocialReportsChannel] = useState<SocialChannelName>('linkedin');
    const [socialReportsScope, setSocialReportsScope] = useState<AnalysisScope>('brand');
    const [socialReportsInstruction, setSocialReportsInstruction] = useState<string>('');
    const [socialReportsCompetitorId, setSocialReportsCompetitorId] = useState<string>('');
    const [socialReportsTasks, setSocialReportsTasks] = useState<any[]>([]);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    const isComplete = hasResults && isWebComplete && isSocialComplete;
    const competitors = brandData?.competitors?.map((c: any) => ({
        id: c.competitor_id,
        name: c.name
    })) || [];

    const {
        taskId: auditorTaskId,
        result: auditorResult,
        isRunning: isAuditorRunning,
        handleRun: handleRunAuditor
    } = useAuditor({
        clientId: brandData.client_id,
        brandId,
        batchId: websiteBatchId,
        scope: websiteAuditScope,
        modelName: websiteAuditModel
    });

    const {
        taskId: socialAuditorTaskId,
        result: socialAuditorResult,
        isRunning: isSocialAuditorRunning,
        handleRun: handleRunSocialAuditor
    } = useSocialAuditor({
        clientId: brandData.client_id,
        brandId,
        batchId: socialBatchId,
        channel: selectedChannel,
        scope: socialAuditScope
    });

    useEffect(() => {
        if (availableChannels.length > 0 && !availableChannels.includes(socialReportsChannel)) {
            setSocialReportsChannel(availableChannels[0] as SocialChannelName);
        }
    }, [availableChannels, socialReportsChannel]);

    useEffect(() => {
        if (socialBatchId && brandData?.client_id) {
            loadSocialReportsTasks();
        }
    }, [socialBatchId, brandData?.client_id]);

    const loadSocialReportsTasks = useCallback(async () => {
        if (!brandData?.client_id) return;
        try {
            const res = await listSocialReportsTasks({
                client_id: brandData.client_id,
                brand_id: brandId,
            });
            if (res.success && res.data?.tasks) {
                setSocialReportsTasks(res.data.tasks);
            }
        } catch (e) {
            console.error("Failed to load social reports tasks", e);
        }
    }, [brandData?.client_id, brandId]);

    const handleRunSocialReports = async () => {
        if (!socialBatchId) {
            toast.error("No social data found. Please run data collection first.");
            return;
        }

        if (socialReportsScope === 'competitors' && !socialReportsCompetitorId) {
            toast.error("Please select a competitor for competitor analysis.");
            return;
        }

        setIsSocialReportsRunning(true);
        setSocialReportsResult(null);
        toast.info(`Starting Social Reports Agent for ${socialReportsChannel} (${socialReportsScope})...`);

        try {
            const res = await runSocialReportsAgent({
                client_id: brandData.client_id,
                brand_id: brandId,
                batch_id: socialBatchId,
                channel_name: socialReportsChannel,
                analysis_scope: socialReportsScope,
                competitor_id: socialReportsScope === 'competitors' ? socialReportsCompetitorId : undefined,
                instruction: socialReportsInstruction || undefined
            });

            if (res.success && res.data?.task_id) {
                setSocialReportsTaskId(res.data.task_id);
                toast.success(`Social Reports Agent started for ${socialReportsChannel}!`);
                pollSocialReportsResult(res.data.task_id);
            } else {
                toast.error(`Social Reports Agent failed: ${res.error || 'Unknown error'}`);
                setIsSocialReportsRunning(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error starting Social Reports Agent");
            setIsSocialReportsRunning(false);
        }
    };

    const pollSocialReportsResult = async (taskId: string) => {
        let attempts = 0;
        const maxAttempts = 120;

        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await getSocialReportsOutput({
                    client_id: brandData.client_id,
                    brand_id: brandId,
                    task_id: taskId
                });

                if (res.success && res.data) {
                    setSocialReportsResult(res.data);
                    toast.success("Social report generated successfully!");
                    setIsSocialReportsRunning(false);
                    clearInterval(interval);
                    loadSocialReportsTasks();
                } else if (attempts >= maxAttempts) {
                    toast.error("Social report generation timed out.");
                    setIsSocialReportsRunning(false);
                    clearInterval(interval);
                }
            } catch (e) {
                console.error("Polling social reports error", e);
            }
        }, 3000);
    };

    const handleSelectSocialReportTask = async (taskId: string) => {
        setSocialReportsTaskId(taskId);
        setIsSocialReportsRunning(true);
        try {
            const res = await getSocialReportsOutput({
                client_id: brandData.client_id,
                brand_id: brandId,
                task_id: taskId
            });
            if (res.success && res.data) {
                setSocialReportsResult(res.data);
            } else {
                toast.error("Failed to load report");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error loading report");
        } finally {
            setIsSocialReportsRunning(false);
        }
    };

    const handleDeleteSocialReportTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
            return;
        }
        setIsDeletingTask(true);
        setDeletingTaskId(taskId);
        try {
            const res = await deleteSocialReportsTask({
                client_id: brandData.client_id,
                brand_id: brandId,
                task_id: taskId
            });
            if (res.success) {
                toast.success("Report deleted successfully");
                if (socialReportsTaskId === taskId) {
                    setSocialReportsTaskId(null);
                    setSocialReportsResult(null);
                }
                loadSocialReportsTasks();
            } else {
                toast.error(`Failed to delete report: ${res.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error deleting report");
        } finally {
            setIsDeletingTask(false);
            setDeletingTaskId(null);
        }
    };

    return (
        <div className="space-y-8 w-full pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-medium tracking-tight">{brandData.name}</h3>
                    <p className="text-muted-foreground">Captured Data & Analysis</p>
                </div>
                <div className="flex gap-2">
                    <RecollectDialog
                        brandId={brandId}
                        brandName={brandData.name}
                        variant="button"
                        trigger={
                            <Button>
                                Re Capture
                            </Button>
                        }
                    />
                    <Button asChild variant={'secondary'}>
                        <Link href="/dashboard/brandos-v2.1/gather">
                            <AiOutlinePieChart className="w-4 h-4" />
                            Data Gathering
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="brand_profile">Brand Profile</TabsTrigger>
                    <TabsTrigger value="captured_data" disabled={!hasResults}>
                        Captured Data
                        {!hasResults && <span className="ml-2 text-xs text-muted-foreground">(pending)</span>}
                    </TabsTrigger>
                    <TabsTrigger value="ai_audit" disabled={!isComplete}>
                        <Bot className="w-4 h-4 mr-1" />
                        Outside-in Audit
                    </TabsTrigger>
                    <TabsTrigger value="social_reports" disabled={!isSocialComplete}>
                        <FileText className="w-4 h-4 mr-1" />
                        Social Reports
                    </TabsTrigger>
                    <TabsTrigger value="web_agents" disabled={!isWebComplete}>
                        <Database className="w-4 h-4 mr-1" />
                        Web Reports
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="brand_profile" className="space-y-6 pt-4">
                    <BrandProfile brand={brandData} isScrapped={true} />
                </TabsContent>

                <TabsContent value="captured_data" className="space-y-6 pt-4">
                    <Tabs defaultValue="website" className="w-full">
                        <TabsList>
                            <TabsTrigger value="website">
                                Website Data
                                {websiteBatchStatus && websiteBatchStatus !== 'Completed' && (
                                    <span className="ml-2 text-xs">({websiteBatchStatus})</span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="social">
                                Social Media Data
                                {socialBatchStatus && socialBatchStatus !== 'Completed' && (
                                    <span className="ml-2 text-xs">({socialBatchStatus})</span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="website" className="pt-6">
                            {websiteSlot}
                        </TabsContent>
                        <TabsContent value="social" className="pt-6">
                            {socialSlot}
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="ai_audit" className="space-y-8 pt-4">
                    <div className="flex flex-col gap-8">
                        <AuditorAgentCard
                            title="Website Auditor"
                            description="Analyze captured website content for verbal bedrock."
                            icon={Globe}
                            agentCode="OI-WEB-AUDIT"
                            status={isAuditorRunning ? 'running' : auditorResult ? 'complete' : 'idle'}
                            isRunning={isAuditorRunning}
                            onRun={handleRunAuditor}
                            taskId={auditorTaskId}
                            result={auditorResult}
                            RenderResult={AuditorResultViewer}
                            isDisabled={!websiteBatchId}
                            buttonLabel="Run Website Audit"
                            controls={
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={websiteAuditModel}
                                        onValueChange={setWebsiteAuditModel}
                                        disabled={isAuditorRunning}
                                    >
                                        <SelectTrigger className="w-[180px] h-9 bg-background">
                                            <SelectValue placeholder="Model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="claude-4.5-sonnet">Claude 4.5 Sonnet</SelectItem>
                                            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                                            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={websiteAuditScope}
                                        onValueChange={setWebsiteAuditScope}
                                        disabled={isAuditorRunning}
                                    >
                                        <SelectTrigger className="w-[140px] h-9 bg-background">
                                            <SelectValue placeholder="Scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brand">Brand Only</SelectItem>
                                            <SelectItem value="competitors">Competitors Only</SelectItem>
                                            <SelectItem value="both">Brand & Competitors</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                        />

                        <AuditorAgentCard
                            title="Social Auditor"
                            description="Extract emergent attributes from social channels."
                            icon={Fingerprint}
                            agentCode="OI-SOC-AUDIT"
                            status={isSocialAuditorRunning ? 'running' : socialAuditorResult ? 'complete' : 'idle'}
                            isRunning={isSocialAuditorRunning}
                            onRun={handleRunSocialAuditor}
                            taskId={socialAuditorTaskId}
                            result={socialAuditorResult}
                            RenderResult={SocialAuditorResultViewer}
                            isDisabled={!socialBatchId || !availableChannels.length}
                            buttonLabel="Run Social Analysis"
                            controls={
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={selectedChannel}
                                        onValueChange={setSelectedChannel}
                                        disabled={isSocialAuditorRunning || !availableChannels.length}
                                    >
                                        <SelectTrigger className="w-[140px] h-9 bg-background">
                                            <SelectValue placeholder="Channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableChannels.length > 0 ? (
                                                availableChannels.map(channel => (
                                                    <SelectItem key={channel} value={channel} className="capitalize">
                                                        {channel}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No Data Available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={socialAuditScope}
                                        onValueChange={setSocialAuditScope}
                                        disabled={isSocialAuditorRunning}
                                    >
                                        <SelectTrigger className="w-[160px] h-9 bg-background">
                                            <SelectValue placeholder="Scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brand">Brand Only</SelectItem>
                                            <SelectItem value="competitors">Competitors Only</SelectItem>
                                            <SelectItem value="both">Brand & Competitors</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                        />
                    </div>
                </TabsContent>

                <TabsContent value="social_reports" className="space-y-8 pt-4">
                    <div className="flex flex-col gap-8">
                        <AuditorAgentCard
                            title="Social Reports Agent"
                            description="Generate comprehensive reports from social media batch data with AI-powered analysis."
                            icon={FileText}
                            agentCode="OI-SOC-REPORTS"
                            status={isSocialReportsRunning ? 'running' : socialReportsResult ? 'complete' : 'idle'}
                            isRunning={isSocialReportsRunning}
                            onRun={handleRunSocialReports}
                            taskId={socialReportsTaskId}
                            result={socialReportsResult}
                            RenderResult={SocialReportsResultViewer}
                            isDisabled={!socialBatchId || !availableChannels.length}
                            buttonLabel="Generate Report"
                            processingLabels={{
                                running: "Generating Report...",
                                processing: "AI agent is analyzing social data and generating report..."
                            }}
                            controls={
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={socialReportsChannel}
                                        onValueChange={(v) => setSocialReportsChannel(v as SocialChannelName)}
                                        disabled={isSocialReportsRunning || !availableChannels.length}
                                    >
                                        <SelectTrigger className="w-[140px] h-9 bg-background capitalize">
                                            <SelectValue placeholder="Channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableChannels.length > 0 ? (
                                                availableChannels.map(channel => (
                                                    <SelectItem key={channel} value={channel} className="capitalize">
                                                        {channel}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No Data Available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={socialReportsScope}
                                        onValueChange={(v) => setSocialReportsScope(v as AnalysisScope)}
                                        disabled={isSocialReportsRunning}
                                    >
                                        <SelectTrigger className="w-[140px] h-9 bg-background">
                                            <SelectValue placeholder="Scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brand">Brand</SelectItem>
                                            <SelectItem value="competitors">Competitors</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {socialReportsScope === 'competitors' && competitors.length > 0 && (
                                        <Select
                                            value={socialReportsCompetitorId}
                                            onValueChange={setSocialReportsCompetitorId}
                                            disabled={isSocialReportsRunning}
                                        >
                                            <SelectTrigger className="w-[180px] h-9 bg-background">
                                                <SelectValue placeholder="Select Competitor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {competitors.map((comp: any) => (
                                                    <SelectItem key={comp.id} value={comp.id}>
                                                        {comp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            }
                        />

                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Custom Instructions (Optional)</CardTitle>
                                <CardDescription className="text-xs">
                                    Provide specific guidance for the AI analysis, e.g., &quot;Focus on visual trends&quot; or &quot;Analyze competitor positioning&quot;
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder="Enter custom instructions for the analysis..."
                                    value={socialReportsInstruction}
                                    onChange={(e) => setSocialReportsInstruction(e.target.value)}
                                    disabled={isSocialReportsRunning}
                                    className="max-w-xl"
                                />
                            </CardContent>
                        </Card>

                        {socialReportsTasks.length > 0 && (
                            <Card>
                                <CardHeader >
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Report History
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        View and manage previously generated social reports
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SocialReportsTaskListViewer
                                        tasks={socialReportsTasks}
                                        onSelectTask={handleSelectSocialReportTask}
                                        onDeleteTask={handleDeleteSocialReportTask}
                                        selectedTaskId={socialReportsTaskId}
                                        isDeleting={isDeletingTask}
                                        deletingTaskId={deletingTaskId}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="web_agents" className="space-y-6 pt-4">
                    <WebAgentsManager
                        clientId={brandData?.client_id}
                        brandId={brandId}
                        batchWebsiteTaskId={websiteBatchId}
                        brandName={brandData?.name}
                        competitors={competitors}
                    />
                </TabsContent>
            </Tabs>

            <Collapsible className="group border rounded-lg bg-muted/20">
                <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <Terminal className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">API Debug Parameters</span>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-3 pt-0 space-y-2 border-t bg-muted/10">
                        <DebugIdRow label="Client ID" value={brandData?.client_id || 'N/A'} />
                        <DebugIdRow label="Brand ID" value={brandId} />
                        <DebugIdRow label="Website Batch ID" value={websiteBatchId || 'N/A'} />
                        <DebugIdRow label="Social Batch ID" value={socialBatchId || 'N/A'} />
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

function DebugIdRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center text-xs h-7">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <code className="bg-background border px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">
                    {value}
                </code>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                        navigator.clipboard.writeText(value);
                        toast.success(`Copied ${label}`);
                    }}
                >
                    <Copy className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

function Globe({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function Fingerprint({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
            <path d="M2 16h.01" />
            <path d="M21.8 16c.2-2 .131-5.354 0-6" />
            <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
        </svg>
    );
}
