'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Copy, Terminal, RefreshCw, Bot, Play, Loader2, CheckCircle2, AlertCircle, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AgentStatusCard } from './AgentStatusCard';
import { AuditorAgentCard } from './AuditorAgentCard';
import { SimpleWebsiteScrapViewer, SimpleSocialScrapViewer } from './ResultsViewers';
import { AuditorResultViewer } from './AuditorResultViewer';
import { SocialAuditorResultViewer } from './SocialAuditorResultViewer';
import BrandProfile from "@/components/stages/ccba/details/profile-tab/BrandProfile";
import { getCcbaTaskStatus } from '@/server/actions/ccba/statusActions';
import { scrapeBatchWebsite } from '@/server/actions/ccba/website/websiteScrapeActions';
import { scrapeBatchSocial } from '@/server/actions/ccba/social/socialScrapeActions';
import { getBatchWebsiteScrapeStatus } from '@/server/actions/ccba/website/websiteStatusAction';
import { getBatchSocialScrapeStatus } from '@/server/actions/ccba/social/socialStatusAction';
import { runAuditorAgent, getAuditorOutput, runSocialAuditorAgent, getSocialAuditorOutput } from '@/server/actions/auditorActions';
import { setGatherCookies } from '@/server/actions/cookieActions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GatherManagerProps {
    brandId: string;
    initialStatus: any;
    brandData: any;
    websiteData: any;
    socialData: any;
    websiteBatchStatus?: string | null;
    socialBatchStatus?: string | null;
    websiteBatchId?: string | null;
    socialBatchId?: string | null;
    webLimit: number;
    startDate: string;
    endDate: string;
}

export function GatherManager({
    brandId,
    initialStatus,
    brandData,
    websiteData,
    socialData,
    websiteBatchStatus,
    socialBatchStatus,
    websiteBatchId,
    socialBatchId,
    webLimit,
    startDate,
    endDate
}: GatherManagerProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [activeTab, setActiveTab] = useState("brand_profile");
    const [isStarting, startTransition] = useTransition();
    const [isPolling, setIsPolling] = useState(false);
    const [pollingMessage, setPollingMessage] = useState<string>("");
    
    // Sync to cookies
    useEffect(() => {
        if (brandId) {
            setGatherCookies({
                brandId,
                startDate,
                endDate,
                webLimit: webLimit.toString()
            }).catch(console.error);
        }
    }, [brandId, startDate, endDate, webLimit]);

    // Batch IDs and Statuses (Local State)
    const [currentWebBatchId, setCurrentWebBatchId] = useState<string | null>(websiteBatchId || null);
    const [currentSocialBatchId, setCurrentSocialBatchId] = useState<string | null>(socialBatchId || null);
    const [webBatchStatus, setWebBatchStatus] = useState<string | null>(websiteBatchStatus || null);
    const [socBatchStatus, setSocBatchStatus] = useState<string | null>(socialBatchStatus || null);

    // Update local state when props change (e.g. after refresh)
    useEffect(() => {
        if (websiteBatchStatus) setWebBatchStatus(websiteBatchStatus);
        if (socialBatchStatus) setSocBatchStatus(socialBatchStatus);
        if (websiteBatchId) setCurrentWebBatchId(websiteBatchId);
        if (socialBatchId) setCurrentSocialBatchId(socialBatchId);
    }, [websiteBatchStatus, socialBatchStatus, websiteBatchId, socialBatchId]);

    // Auditor State
    const [auditorTaskId, setAuditorTaskId] = useState<string | null>(null);
    const [auditorResult, setAuditorResult] = useState<any>(null);
    const [isAuditorRunning, setIsAuditorRunning] = useState(false);
    const [websiteAuditScope, setWebsiteAuditScope] = useState<string>("both");

    // Social Auditor State
    const [socialAuditorTaskId, setSocialAuditorTaskId] = useState<string | null>(null);
    const [socialAuditorResult, setSocialAuditorResult] = useState<any>(null);
    const [isSocialAuditorRunning, setIsSocialAuditorRunning] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<string>("linkedin");
    const [socialAuditScope, setSocialAuditScope] = useState<string>("brand");

    const hasResults = !!(websiteData || socialData);
    const isWebComplete = webBatchStatus === 'Completed' || webBatchStatus === 'CompletedWithErrors';
    const isSocialComplete = socBatchStatus === 'Completed' || socBatchStatus === 'CompletedWithErrors';
    const isComplete = hasResults && isWebComplete && isSocialComplete;
    const isRunning = (status && status.total_running > 0) || isPolling;

    // --- Auditors Logic ---
    // Calculate available social channels from captured data
    const availableChannels = (() => {
        if (!socialData) return [];
        let channels: string[] = [];

        // Check if socialData itself is an array of objects (posts/profiles)
        if (Array.isArray(socialData)) {
             channels = socialData.map((item: any) => item.platform || item.network || item.channel || item.source).filter(Boolean);
        }
        // Check for posts array inside
        else if (socialData.posts && Array.isArray(socialData.posts)) {
            channels = socialData.posts.map((item: any) => item.platform || item.network || item.channel || item.source).filter(Boolean);
        }
        // Scenario 1: centralized social_platforms array
        else if (socialData.social_platforms && Array.isArray(socialData.social_platforms)) {
            channels = socialData.social_platforms.map((p: any) => p.name || p.network || p.platform);
        }
        // Scenario 2: Nested in brand object
        else if (socialData.brand?.social_platforms && Array.isArray(socialData.brand.social_platforms)) {
            channels = socialData.brand.social_platforms.map((p: any) => p.name || p.network || p.platform);
        }
        // Scenario 3: socialData itself is the brand object with social_platforms
        else if (Array.isArray(socialData.social_platforms)) {
             channels = socialData.social_platforms.map((p: any) => p.name || p.network || p.platform);
        }
        // Scenario 4: keyed object (e.g. { linkedin: {...}, facebook: {...} })
        else if (typeof socialData === 'object') {
             // check for known keys
             const knownPlatforms = ['linkedin', 'facebook', 'instagram', 'x', 'twitter', 'youtube', 'tiktok'];
             channels = Object.keys(socialData).filter(key => knownPlatforms.includes(key.toLowerCase()));
        }

        const unique = Array.from(new Set(channels.filter(Boolean).map(c => c.toLowerCase())));
        
        // Fallback: If data exists but no channels extracted, default to allow selection
        if (unique.length === 0 && (Array.isArray(socialData) ? socialData.length > 0 : Object.keys(socialData).length > 0)) {
            // Check specifically for common structures
            if (JSON.stringify(socialData).toLowerCase().includes('linkedin')) return ['linkedin'];
            return ['linkedin']; // Default fallback to ensure usability
        }
        
        return unique;
    })();

    // Set initial selected channel if available
    useEffect(() => {
        if (availableChannels.length > 0 && !availableChannels.includes(selectedChannel)) {
            setSelectedChannel(availableChannels[0]);
        }
    }, [availableChannels, selectedChannel]);



    const handleRunAuditor = async () => {
        if (!currentWebBatchId) {
            toast.error("No website data found. Please run data collection first.");
            return;
        }
        setIsAuditorRunning(true);
        toast.info(`Starting Website Auditor analysis (${websiteAuditScope})...`);
        try {
            const res = await runAuditorAgent({
                client_id: brandData.client_id,
                brand_id: brandId,
                batch_id: currentWebBatchId,
                analysis_scope: websiteAuditScope as any
            });

            if (res.success && res.data?.task_id) {
                setAuditorTaskId(res.data.task_id);
                toast.success("Auditor Agent started! Analyzing content...");
                // Start polling for result
                pollAuditorResult(res.data.task_id);
            } else {
                toast.error(`Auditor failed to start: ${res.error || 'Unknown error'}`);
                setIsAuditorRunning(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error starting Auditor Agent");
            setIsAuditorRunning(false);
        }
    };

    const pollAuditorResult = async (taskId: string) => {
        let attempts = 0;
        const maxAttempts = 60; // 2 minutes approx (2s interval)
        
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await getAuditorOutput({
                    client_id: brandData.client_id,
                    brand_id: brandId,
                    task_id: taskId
                });

                if (res.success && res.data) {
                    setAuditorResult(res.data);
                    toast.success("Auditor analysis complete!");
                    setIsAuditorRunning(false);
                    clearInterval(interval);
                } else if (attempts >= maxAttempts) {
                    toast.error("Auditor analysis timed out. Please try fetching later.");
                    setIsAuditorRunning(false);
                    clearInterval(interval);
                }
            } catch (e) {
                console.error("Polling auditor error", e);
            }
        }, 3000);
    };

    const handleRunSocialAuditor = async () => {
        if (!currentSocialBatchId) {
            toast.error("No social data found. Please run data collection first.");
            return;
        }
        setIsSocialAuditorRunning(true);
        setSocialAuditorResult(null); // Clear previous
        toast.info(`Starting Social Auditor Analysis for ${selectedChannel} (${socialAuditScope})...`);

        try {
            const res = await runSocialAuditorAgent({
                client_id: brandData.client_id,
                brand_id: brandId,
                batch_id: currentSocialBatchId,
                channel_name: selectedChannel as any, // Cast to expected type
                analysis_scope: socialAuditScope as any
            });

            if (res.success && res.data?.task_id) {
                setSocialAuditorTaskId(res.data.task_id);
                toast.success(`Social Auditor started for ${selectedChannel}!`);
                pollSocialAuditorResult(res.data.task_id);
            } else {
                toast.error(`Social Auditor failed: ${res.error || 'Unknown error'}`);
                setIsSocialAuditorRunning(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error starting Social Auditor");
            setIsSocialAuditorRunning(false);
        }
    };

    const pollSocialAuditorResult = async (taskId: string) => {
        let attempts = 0;
        const maxAttempts = 60; 
        
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await getSocialAuditorOutput({
                    client_id: brandData.client_id,
                    brand_id: brandId,
                    task_id: taskId
                });

                if (res.success && res.data) {
                    setSocialAuditorResult(res.data);
                    toast.success("Social analysis complete!");
                    setIsSocialAuditorRunning(false);
                    clearInterval(interval);
                } else if (attempts >= maxAttempts) {
                    toast.error("Social analysis timed out.");
                    setIsSocialAuditorRunning(false);
                    clearInterval(interval);
                }
            } catch (e) {
                console.error("Polling social auditor error", e);
            }
        }, 3000);
    };

    // --- Polling Logic ---
    const checkBatchStatuses = useCallback(async () => {
        let webStatus = null;
        let socialStatus = null;

        if (currentWebBatchId) {
            webStatus = await getBatchWebsiteScrapeStatus(brandId, currentWebBatchId);
            if (webStatus?.status) setWebBatchStatus(webStatus.status); // Update local status
        }
        if (currentSocialBatchId) {
            socialStatus = await getBatchSocialScrapeStatus(brandId, currentSocialBatchId);
            if (socialStatus?.status) setSocBatchStatus(socialStatus.status); // Update local status
        }
        
        const taskStatus = await getCcbaTaskStatus(brandId);
        setStatus(taskStatus);
        
        return { webStatus, socialStatus, taskStatus };
    }, [brandId, currentWebBatchId, currentSocialBatchId]);

    useEffect(() => {
        if (!isPolling) return;
        let pollCount = 0;
        const maxPolls = 36; 

        const interval = setInterval(async () => {
            pollCount++;
            setPollingMessage(`Checking status... (${pollCount})`);
            try {
                const { webStatus, socialStatus, taskStatus } = await checkBatchStatuses();
                
                // Use the returned status or local state for checks
                const webDone = webStatus?.status === 'Completed' || webStatus?.status === 'CompletedWithErrors' || webStatus?.status === 'Failed';
                const socialDone = socialStatus?.status === 'Completed' || socialStatus?.status === 'CompletedWithErrors' || socialStatus?.status === 'Failed';
                const tasksRunning = taskStatus?.total_running > 0;

                // If both are done OR failed OR we don't have IDs for them (shouldn't happen if we started them), AND global tasks are 0
                if ((webDone || !currentWebBatchId) && (socialDone || !currentSocialBatchId) && !tasksRunning) {
                    toast.success("Data collection completed!");
                    setPollingMessage("");
                    clearInterval(interval);
                    setIsPolling(false);
                    startTransition(() => {
                        router.refresh();
                    });
                    return;
                }
                
                // Construct progress string
                let msgParts = [];
                if (webStatus?.progress) msgParts.push(`Web: ${webStatus.progress.completed}/${webStatus.progress.total_urls}`);
                if (socialStatus?.status) msgParts.push(`Social: ${socialStatus.status}`);
                
                setPollingMessage(msgParts.length > 0 ? msgParts.join(" | ") : "Processing...");
                
            } catch (e) {
                console.error("[GatherManager] Polling error:", e);
            }
            if (pollCount >= maxPolls) {
                setIsPolling(false);
                setPollingMessage("");
                clearInterval(interval);
            }
        }, 10000); 

        return () => clearInterval(interval);
    }, [isPolling, checkBatchStatuses, router, currentWebBatchId, currentSocialBatchId]);

    const handleStartCollection = () => {
        startTransition(async () => {
            if (!startDate) {
                toast.error("Start Date is required.");
                return;
            }
            toast.info("Initializing Data Collection Swarm...");
            // Reset local statuses to indicate starting
            setWebBatchStatus("Initializing");
            setSocBatchStatus("Initializing");
            
            try {
                const webResult = await scrapeBatchWebsite(brandId, webLimit);
                if (!webResult?.success) {
                    toast.error(`Website capture failed: ${webResult?.message}`);
                    return;
                }
                if (webResult.data?.task_id) setCurrentWebBatchId(webResult.data.task_id);

                const socialResult = await scrapeBatchSocial(brandId, startDate, endDate);
                if (!socialResult?.success) {
                    toast.error(`Social capture failed: ${socialResult?.message}`);
                    return;
                }
                
                // Set Social Batch ID - handle both task_id and batch_id
                const sBatchId = socialResult.data?.task_id || socialResult.data?.batch_id;
                if (sBatchId) {
                    setCurrentSocialBatchId(sBatchId);
                    console.log("Social Batch ID set to:", sBatchId);
                } else {
                    console.warn("No Social Batch ID returned", socialResult);
                }

                toast.success("Swarm agents deployed.");
                setIsPolling(true);
            } catch (e) {
                console.error(e);
                toast.error("Trigger error");
            }
        });
    };

    return (
        <div className="space-y-8 w-full pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-medium tracking-tight">Data Collection Agent</h3>
                    <p className="text-muted-foreground">Real-time status of the multi-source data collection swarm and auditors.</p>
                    {pollingMessage && <p className="text-sm text-blue-500 mt-1">{pollingMessage}</p>}
                </div>
                 <Button variant="outline" asChild>
                    <Link href="/dashboard/brandos-v2.1/gather">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Switch Brand
                    </Link>
                </Button>
            </div>

            <div className="space-y-4">
                <AgentStatusCard 
                    status={status} 
                    isComplete={isComplete} 
                    hasData={hasResults} 
                    onStart={handleStartCollection}
                    isStarting={isStarting || isPolling}
                />
            </div>

            {brandData && (
                <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-medium tracking-tight">Intelligence Hub</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="brand_profile">Brand Profile</TabsTrigger>
                            <TabsTrigger value="captured_data" disabled={!hasResults}>
                                Captured Data
                                {!hasResults && <span className="ml-2 text-xs text-muted-foreground">(pending)</span>}
                            </TabsTrigger>
                            <TabsTrigger value="ai_audit" disabled={!isComplete}>
                                <Bot className="w-4 h-4" />
                                Outside-in Audit
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="brand_profile" className="space-y-6">
                            <BrandProfile brand={brandData} isScrapped={true} />
                        </TabsContent>

                        <TabsContent value="captured_data" className="space-y-6">
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
                                    <SimpleWebsiteScrapViewer scrapsData={websiteData} brandName={brandData.name} status={websiteBatchStatus} />
                                </TabsContent>
                                <TabsContent value="social" className="pt-6">
                                    <SimpleSocialScrapViewer scrapsData={socialData} brandName={brandData.name} brandData={brandData} status={socialBatchStatus} />
                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        <TabsContent value="ai_audit" className="space-y-8 pt-4">
                            <div className="flex flex-col gap-8">
                                {/* Website Auditor Section */}
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
                                    isDisabled={!currentWebBatchId}
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

                                {/* Social Auditor Section */}
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
                                    isDisabled={!currentSocialBatchId || !availableChannels.length}
                                    buttonLabel="Run Analysis"
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
                                                            <SelectItem key={channel} value={channel} className="capitalize">{channel}</SelectItem>
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
                </div>
            )}

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
                        <DebugIdRow label="Website Batch ID" value={currentWebBatchId || websiteBatchId || 'N/A'} />
                        <DebugIdRow label="Social Batch ID" value={currentSocialBatchId || socialBatchId || 'N/A'} />
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

function DebugIdRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-xs h-7">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <code className="bg-background border px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">{value}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success(`Copied ${label}`);
                }}>
                    <Copy className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

function Globe({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
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
    )
}
