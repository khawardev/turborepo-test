'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Terminal, LayoutGrid, Bot, RefreshCw } from 'lucide-react';
import { SimpleWebsiteScrapViewer, SimpleSocialScrapViewer } from '../ResultsViewers';
import BrandProfile from '@/components/stages/ccba/details/profile-tab/BrandProfile';
import { AuditorAgentCard } from '../AuditorAgentCard';
import { AuditorResultViewer } from '../AuditorResultViewer';
import { SocialAuditorResultViewer } from '../SocialAuditorResultViewer';
import { runAuditorAgent, getAuditorOutput, runSocialAuditorAgent, getSocialAuditorOutput } from '@/server/actions/auditorActions';
import { useAuditor } from './hooks/UseAuditor';
import { useSocialAuditor } from './hooks/UseSocialAuditor';
import { AiOutlinePieChart } from "react-icons/ai";

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
    const [socialAuditScope, setSocialAuditScope] = useState<string>('brand');
    const [selectedChannel, setSelectedChannel] = useState<string>('linkedin');
    
    // Derived state moved to parent or props
    const isComplete = hasResults && isWebComplete && isSocialComplete;

    const {
        taskId: auditorTaskId,
        result: auditorResult,
        isRunning: isAuditorRunning,
        handleRun: handleRunAuditor
    } = useAuditor({
        clientId: brandData.client_id,
        brandId,
        batchId: websiteBatchId,
        scope: websiteAuditScope
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

    return (
        <div className="space-y-8 w-full pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-medium tracking-tight">{brandData.name}</h3>
                    <p className="text-muted-foreground">Captured Data & Analysis</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant={'secondary'}>
                        <Link href={`/dashboard/brandos-v2.1/gather/collecting/${brandId}`}>
                            <RefreshCw className="w-4 h-4" />
                            Re Collect
                        </Link>
                    </Button>
                    <Button asChild variant={'secondary'}>
                        <Link href="/dashboard/brandos-v2.1/gather">
                            <AiOutlinePieChart className="w-4 h-4" />
                            Gather Data
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
                                <Select
                                    value={websiteAuditScope}
                                    onValueChange={setWebsiteAuditScope}
                                    disabled={isAuditorRunning}
                                >
                                    <SelectTrigger className="w-[180px] h-9 bg-background">
                                        <SelectValue placeholder="Scope" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brand">Brand Only</SelectItem>
                                        <SelectItem value="competitors">Competitors Only</SelectItem>
                                        <SelectItem value="both">Brand & Competitors</SelectItem>
                                    </SelectContent>
                                </Select>
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

function getAvailableSocialChannels(socialData: any): string[] {
    if (!socialData) return [];
    let channels: string[] = [];

    if (Array.isArray(socialData)) {
        channels = socialData.map((item: any) => item.platform || item.network || item.channel || item.source).filter(Boolean);
    } else if (socialData.posts && Array.isArray(socialData.posts)) {
        channels = socialData.posts.map((item: any) => item.platform || item.network || item.channel || item.source).filter(Boolean);
    } else if (socialData.social_platforms && Array.isArray(socialData.social_platforms)) {
        channels = socialData.social_platforms.map((p: any) => p.name || p.network || p.platform);
    } else if (socialData.brand?.social_platforms && Array.isArray(socialData.brand.social_platforms)) {
        channels = socialData.brand.social_platforms.map((p: any) => p.name || p.network || p.platform);
    } else if (typeof socialData === 'object') {
        const knownPlatforms = ['linkedin', 'facebook', 'instagram', 'x', 'twitter', 'youtube', 'tiktok'];
        channels = Object.keys(socialData).filter(key => knownPlatforms.includes(key.toLowerCase()));
    }

    const unique = Array.from(new Set(channels.filter(Boolean).map(c => c.toLowerCase())));

    if (unique.length === 0 && (Array.isArray(socialData) ? socialData.length > 0 : Object.keys(socialData).length > 0)) {
        if (JSON.stringify(socialData).toLowerCase().includes('linkedin')) return ['linkedin'];
        return ['linkedin'];
    }

    return unique;
}
