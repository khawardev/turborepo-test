'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eye, MessageSquare, Heart, Hash, Globe, Activity, TrendingUp, Target, Star, Users, Lightbulb, Zap } from "lucide-react";

interface SocialAuditorResultViewerProps {
    data: any; // Social Auditor Output JSON
}

export function SocialAuditorResultViewer({ data }: SocialAuditorResultViewerProps) {
    if (!data || !data.social_audit_report) return null;

    const { social_audit_report } = data;
    const { 
        profile_snapshot = {}, 
        emergent_brand_attributes = {}, 
        channel_specific_insights = {}, 
        engagement_analysis = {} 
    } = social_audit_report;

    const attributes = [
        { key: 'VoiceTone', label: 'Voice & Tone', icon: MessageSquare },
        { key: 'Positioning', label: 'Positioning', icon: Target },
        { key: 'RhetoricalStyle', label: 'Rhetorical Style', icon: Eye },
        { key: 'BusinessDrivers', label: 'Business Drivers', icon: Activity },
        { key: 'Personas', label: 'Target Personas', icon: Users },
        { key: 'Lexicon', label: 'Lexicon', icon: Hash },
        { key: 'Values', label: 'Core Values', icon: Heart },
        { key: 'BrandPromise', label: 'Brand Promise', icon: Star },
        { key: 'KeyThemes', label: 'Key Themes', icon: Lightbulb },
    ];

    // Helper to render Finding + Evidence sections
    const renderAnalysisSection = (data: any) => {
        if (!data) return null;
        // Check if data follows { finding, evidence } structure
        const finding = data.finding;
        const evidence = Array.isArray(data.evidence) ? data.evidence : [];

        if (!finding && evidence.length === 0) {
             // Fallback for simple string or array if schema differs
             if (typeof data === 'string') return <p className="text-sm text-foreground/90">{data}</p>;
             if (Array.isArray(data)) return (
                <div className="flex flex-wrap gap-2">
                    {data.map((item, i) => (
                        <Badge key={i} variant="secondary">{item}</Badge>
                    ))}
                </div>
             );
             return null;
        }

        return (
            <div className="space-y-3">
                {finding && (
                    <p className="text-sm leading-relaxed text-foreground/90">
                        {finding}
                    </p>
                )}
                {evidence.length > 0 && (
                    <div className="bg-muted/30 rounded-md p-3 border border-muted/50">
                        <h6 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Evidence & Verbatim</h6>
                        <ul className="space-y-2">
                            {evidence.slice(0, 4).map((item: string, idx: number) => (
                                <li key={idx} className="text-xs italic text-muted-foreground flex gap-2">
                                    <span className="shrink-0 text-primary/50">"</span>
                                    <span>{item.length > 150 ? item.substring(0, 150) + "..." : item}</span>
                                    <span className="shrink-0 text-primary/50">"</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Cards: Channel & Engagement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Channel Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="text-xl font-bold capitalize">{data.channel_name || 'Social Channel'}</div>
                             {profile_snapshot.last_updated && <span className="text-[10px] text-muted-foreground ml-auto">Updated: {profile_snapshot.last_updated}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Followers</span>
                                <span className="font-mono font-bold">{profile_snapshot.follower_count?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Posts Analyzed</span>
                                <span className="font-mono font-bold">{social_audit_report.audit_metadata?.posts_analyzed || data.scraped_urls_count || 'N/A'}</span>
                            </div>
                        </div>
                        {profile_snapshot.bio_description && (
                            <div className="mt-4 text-xs italic text-muted-foreground border-l-2 border-primary/20 pl-3">
                                {profile_snapshot.bio_description}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Activity className="h-4 w-4" /> Engagement Pulse
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                         {engagement_analysis.engagement_patterns?.content_type_performance ? (
                             <div className="space-y-3">
                                 <div className="text-xs font-medium text-muted-foreground">Top Performing Content Types</div>
                                 <div className="space-y-2">
                                     {Object.entries(engagement_analysis.engagement_patterns.content_type_performance).slice(0, 2).map(([type, perf]: [string, any], i) => (
                                         <div key={i} className="text-xs bg-muted/20 p-2 rounded">
                                             <span className="font-semibold capitalize text-foreground">{type.replace(/_/g, ' ')}:</span> <span className="text-muted-foreground">{perf.toString().substring(0, 60)}...</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ) : (
                            <div className="flex items-center justify-center h-24 text-muted-foreground text-xs italic">
                                Limited engagement data available
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>

            <Accordion type="multiple" defaultValue={["attributes", "insights"]} className="w-full">
                
                {/* Brand Attributes */}
                 <AccordionItem value="attributes" className="border rounded-lg px-4 mb-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Emergent Brand Attributes</h4>
                                <p className="text-xs text-muted-foreground font-normal">Personality, tone, and strategic drivers</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        {attributes.map((attr) => {
                            const attrData = emergent_brand_attributes[attr.key];
                            if (!attrData) return null;
                            const Icon = attr.icon;
                            
                            return (
                                <div key={attr.key} className="relative pl-4 border-l-2 border-primary/20 hover:border-primary/50 transition-colors">
                                    <h5 className="flex items-center gap-2 font-medium text-sm mb-2 text-primary">
                                        <Icon className="w-4 h-4" /> {attr.label}
                                    </h5>
                                    {renderAnalysisSection(attrData)}
                                </div>
                            );
                        })}
                    </AccordionContent>
                </AccordionItem>

                {/* Channel Specific Insights */}
                 <AccordionItem value="insights" className="border rounded-lg px-4 mb-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500/10 p-2 rounded-full text-orange-500">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Channel Insights</h4>
                                <p className="text-xs text-muted-foreground font-normal">Platform performance and strategy</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-8">
                        {/* Channel Specific Keys */}
                        {Object.entries(channel_specific_insights).map(([key, val]: [string, any]) => (
                             <div key={key} className="space-y-2">
                                 <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                     <Zap className="w-3 h-3 text-orange-500" />
                                     {key.replace(/_/g, ' ')}
                                 </h5>
                                 {renderAnalysisSection(val)}
                             </div>
                        ))}

                         {/* Comment Quality Analysis (if presents in Engagement but relevant here) */}
                         {engagement_analysis.comment_quality_analysis && (
                             <div className="space-y-2 pt-4 border-t">
                                 <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                     <MessageSquare className="w-3 h-3 text-blue-500" />
                                     Community Sentiment
                                 </h5>
                                 {renderAnalysisSection(engagement_analysis.comment_quality_analysis)}
                             </div>
                         )}
                    </AccordionContent>
                </AccordionItem>

                {/* Engagement Deep Dive */}
                {engagement_analysis.top_performing_posts && engagement_analysis.top_performing_posts.length > 0 && (
                    <AccordionItem value="engagement" className="border rounded-lg px-4 mb-4 bg-card">
                         <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/10 p-2 rounded-full text-green-500">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-base">Top Content</h4>
                                    <p className="text-xs text-muted-foreground font-normal">Highest performing posts</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {engagement_analysis.top_performing_posts.map((post: any, idx: number) => (
                                    <div key={idx} className="bg-muted/20 p-3 rounded-lg border text-sm space-y-2">
                                        <p className="italic text-muted-foreground line-clamp-3">"{post.text_preview}"</p>
                                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-2 border-t border-muted/50">
                                            {post.likes !== "0" && <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>}
                                            {post.comments !== "0" && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>}
                                            {post.engagement_rate && <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {(parseFloat(post.engagement_rate) * 100).toFixed(2)}%</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>

            <div className="mt-8 pt-4 border-t">
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Terminal className="h-4 w-4" />
                        <span className="font-medium">Raw Analysis Data</span>
                    </summary>
                    <div className="mt-4 bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[500px] border">
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                </details>
            </div>
        </div>
    );
}

function Terminal({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" x2="20" y1="19" y2="19" />
        </svg>
    )
}
