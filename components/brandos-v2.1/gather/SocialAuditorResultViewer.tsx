'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
    Eye, MessageSquare, Heart, Hash, Globe, Activity, TrendingUp, Target, 
    Star, Users, Lightbulb, Zap, Calendar, MapPin, Briefcase, Info, 
    Megaphone, CheckCircle2, Quote, Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialAuditorResultViewerProps {
    data: any; 
}

export function SocialAuditorResultViewer({ data }: SocialAuditorResultViewerProps) {
    if (!data || !data.social_audit_report) return null;

    const { social_audit_report } = data;
    const { 
        profile_snapshot = {}, 
        emergent_brand_attributes = {}, 
        channel_specific_insights = {}, 
        engagement_analysis = {},
        audit_metadata = {}
    } = social_audit_report;

    // Helper to format keys like "best_posting_times" -> "Best Posting Times"
    const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* 1. Header & Profile Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2  shadow-sm bg-gradient-to-r from-background to-muted/20">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {audit_metadata.channel_name || data.channel_name || 'Social Audit Report'}
                                </CardTitle>
                                <CardDescription>
                                    Analysis Window: {audit_metadata.analysis_window || 'N/A'}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="flex gap-1 items-center px-3 py-1 bg-background">
                                    <Activity className="w-3.5 h-3.5 text-primary" />
                                    {audit_metadata.posts_analyzed || '0'} Posts
                                </Badge>
                                <Badge variant="outline" className="flex gap-1 items-center px-3 py-1 bg-background">
                                    <Users className="w-3.5 h-3.5 text-primary" />
                                    {parseInt(profile_snapshot.follower_count || '0').toLocaleString()} Followers
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {profile_snapshot.bio_description && (
                            <div className="relative">
                                <Quote className="w-8 h-8 text-muted-foreground/10 absolute -top-2 -left-2" />
                                <p className="text-sm text-muted-foreground  pl-8 leading-relaxed">
                                    {profile_snapshot.bio_description}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* KPI / Quick Stats Card */}
                 <Card >
                    <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Audit Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                            <span className="text-sm font-medium">Agent</span>
                            <span className="text-sm text-muted-foreground">{audit_metadata.agent_name || 'Social Auditor'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                            <span className="text-sm font-medium">Date</span>
                            <span className="text-sm text-muted-foreground">
                                {new Date(audit_metadata.analysis_date || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Posts</span>
                            <span className="text-sm text-primary">{audit_metadata.posts_analyzed} Analysis</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Top Performing Content */}
            {engagement_analysis.top_performing_posts?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Top Performing Content
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {engagement_analysis.top_performing_posts.map((post: any, idx: number) => (
                            <Card key={idx} className="flex flex-col h-full hover:shadow-md transition-shadow bg-card border-l-4 border-l-green-500/50">
                                <CardContent className="pt-4 flex-1 space-y-3">
                                    <p className="text-sm text-foreground/90 italic line-clamp-4 relative">
                                        <span className="text-green-500/40 text-2xl absolute -top-2 -left-1">"</span>
                                        <span className="pl-3">{post.text_preview}</span>
                                    </p>
                                    
                                     {post.engagement_note && (
                                        <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-xs text-green-800 dark:text-green-200 mt-2">
                                            <strong>Insight:</strong> {post.engagement_note}
                                        </div>
                                    )}
                                </CardContent>
                                <div className="p-3 bg-muted/30 border-t flex justify-between items-center text-xs font-medium text-muted-foreground">
                                     <div className="flex gap-3">
                                        {post.likes !== "0" && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>}
                                        {post.comments !== "0" && <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.comments}</span>}
                                        {post.shares !== "0" && <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> {post.shares}</span>}
                                     </div>
                                     {post.engagement_rate && (
                                         <Badge variant="secondary" className="font-mono text-[10px]">
                                             {(parseFloat(post.engagement_rate) * 100).toFixed(3)}% ER
                                         </Badge>
                                     )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Emergent Brand Attributes */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Emergent Brand DNA
                </h3>
                <div className="grid grid-cols-1 gap-4">
                     <Accordion type="multiple" defaultValue={['Positioning', 'Values']} className="w-full space-y-2">
                        {Object.entries(emergent_brand_attributes).map(([key, attr]: [string, any]) => {
                             if (!attr || (!attr.finding && (!attr.evidence || attr.evidence.length === 0))) return null;
                             
                             const Icon = getAttributeIcon(key);
                             const label = formatKey(key);

                             return (
                                <AccordionItem key={key} value={key} className="border rounded-lg bg-card px-2">
                                    <AccordionTrigger className="hover:no-underline py-3 px-2">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="bg-muted p-2 rounded-full hidden sm:block">
                                                <Icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-base">{label}</h4>
                                                {attr.finding && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 font-normal text-left pr-4">
                                                        {attr.finding.substring(0, 100)}...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-2 pb-4">
                                        <div className="space-y-4 pt-2">
                                            {attr.finding && (
                                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                                    <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                                                        {attr.finding}
                                                    </p>
                                                </div>
                                            )}
                                            {attr.evidence && attr.evidence.length > 0 && (
                                                <div className="pl-4 border-l-2 border-muted">
                                                    <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Supporting Evidence</h5>
                                                    <ul className="space-y-2">
                                                        {attr.evidence.map((ev: string, i: number) => (
                                                            <li key={i} className="text-xs italic text-muted-foreground">
                                                                "{ev}"
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                             )
                        })}
                     </Accordion>
                </div>
            </div>

            {/* 4. Strategic Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Engagement Patterns */}
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Engagement Patterns
                    </h3>
                    <Card className="bg-card h-full">
                        <CardContent className="pt-6 space-y-6">
                             {engagement_analysis.engagement_patterns?.engagement_quality && (
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        Quality of Engagement
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {engagement_analysis.engagement_patterns.engagement_quality}
                                    </p>
                                </div>
                             )}

                             {engagement_analysis.engagement_patterns?.content_type_performance && (
                                 <div className="space-y-2">
                                     <h4 className="text-sm font-semibold">Content Performance</h4>
                                     <div className="grid gap-2">
                                         {Object.entries(engagement_analysis.engagement_patterns.content_type_performance).map(([k, v]: [string, any]) => (
                                             <div key={k} className="bg-muted/30 p-2 rounded text-xs">
                                                 <span className="font-semibold capitalize text-foreground">{formatKey(k)}:</span> <span className="text-muted-foreground">{v}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                             {engagement_analysis.engagement_patterns?.comment_sentiment_patterns && (
                                 <div className="space-y-2">
                                     <h4 className="text-sm font-semibold">Sentiment Drivers</h4>
                                      <div className="grid gap-2">
                                         {Object.entries(engagement_analysis.engagement_patterns.comment_sentiment_patterns).map(([k, v]: [string, any]) => (
                                             <div key={k} className="bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded text-xs border border-blue-100 dark:border-blue-900/30">
                                                 <span className="font-semibold capitalize text-blue-700 dark:text-blue-300">{formatKey(k)}:</span> <span className="text-muted-foreground block mt-1">{v}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}
                        </CardContent>
                    </Card>
                </div>

                {/* Channel Insights */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-orange-600" />
                        Channel Strategy
                    </h3>
                    <div className="space-y-4">
                        {/* Recursive styling for channel insights */}
                        {Object.entries(channel_specific_insights).map(([category, insights]: [string, any]) => (
                            <Card key={category} className="shadow-sm">
                                <CardHeader className="py-3 bg-muted/20 border-b">
                                     <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-orange-500" />
                                        {formatKey(category)}
                                     </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-3 space-y-2">
                                    {typeof insights === 'string' ? (
                                        <p className="text-sm text-muted-foreground">{insights}</p>
                                    ) : (
                                        Object.entries(insights).map(([k, v]: [string, any]) => (
                                            <div key={k} className="text-xs">
                                                <div className="font-semibold text-foreground mb-0.5">{formatKey(k)}</div>
                                                {Array.isArray(v) ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {v.map((tag, i) => <Badge key={i} variant="secondary" className="font-normal text-[10px]">{tag}</Badge>)}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">{String(v)}</p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Zero Engagement Anomaly / Warnings */}
            {engagement_analysis.zero_engagement_anomaly && (
                 <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex gap-3 text-sm">
                     <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                     <div className="space-y-1 text-amber-900 dark:text-amber-100">
                         <p className="font-medium">Analysis Note: {engagement_analysis.zero_engagement_anomaly.observation}</p>
                         <p className="text-amber-700 dark:text-amber-300/80 text-xs">
                             {engagement_analysis.zero_engagement_anomaly.impact_on_analysis}
                         </p>
                     </div>
                 </div>
            )}

            {/* Raw Data (Collapsed) */}
            <div className="mt-8 pt-4 border-t">
                <Accordion type="single" collapsible>
                    <AccordionItem value="raw" className="border-none">
                        <AccordionTrigger className="text-xs text-muted-foreground py-2 justify-start gap-2 hover:no-underline hover:text-foreground">
                             Review Raw JSON Data
                        </AccordionTrigger>
                        <AccordionContent>
                             <ScrollArea className="h-64 rounded-md border bg-muted/50 p-4">
                                <pre className="text-[10px] font-mono whitespace-pre-wrap">
                                    {JSON.stringify(data, (key, value) => {
                                        if (key === 'model_used') return undefined; // Hide model used
                                        return value;
                                    }, 2)}
                                </pre>
                            </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}


// Helper for Icons
const getAttributeIcon = (key: string) => {
    const map: Record<string, any> = {
        'VoiceTone': MessageSquare,
        'Positioning': Target,
        'RhetoricalStyle': Eye,
        'BusinessDrivers': Activity,
        'Personas': Users,
        'Lexicon': Hash,
        'Values': Heart,
        'BrandPromise': Star,
        'KeyThemes': Lightbulb,
        'ProductNarratives': Megaphone,
        'CommunityEngagement': Globe,
        'LeadershipVoice': Briefcase,
        'EmployerBrand': Users,
    };
    return map[key] || CheckCircle2;
}
