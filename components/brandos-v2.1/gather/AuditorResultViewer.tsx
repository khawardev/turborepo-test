'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb, Target, Users, Megaphone, CheckCircle, FileText, BarChart3, Check, Terminal, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface AuditorResultViewerProps {
    data: any; // Auditor Output JSON
    onReRun?: () => void;
    isReRunning?: boolean;
}

export function AuditorResultViewer({ data, onReRun, isReRunning = false }: AuditorResultViewerProps) {
    if (!data || !data.verbal_bedrock) return null;
    
    const { verbal_bedrock } = data;
    
    // Destructuring based on new schema
    const metadata = verbal_bedrock.verbal_audit_metadata || {};
    const narrative = verbal_bedrock.narrative_data_points || {};
    const themes = verbal_bedrock.emergent_themes || {};
    const positioning = verbal_bedrock.positioning_markers || {};
    const proof = verbal_bedrock.proof_points || {};
    const audience = verbal_bedrock.audience_markers || {};
    const baseline = verbal_bedrock.corpus_baseline || {};
    const ctas = verbal_bedrock.calls_to_action || {};

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Audit Complete
                 </h3>
                 {onReRun && (
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onReRun} 
                        disabled={isReRunning}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", isReRunning && "animate-spin")} />
                        {isReRunning ? "Running..." : "Re-run Analysis"}
                     </Button>
                 )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Analyzed Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.scraped_urls_count || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">Pages Analyzed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" /> Word Count
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{baseline.total_words_analyzed || '0'}</div>
                        <p className="text-xs text-muted-foreground">Total Words Analyzed</p>
                    </CardContent>
                </Card>

            </div>

            <Accordion type="multiple" defaultValue={["narrative", "themes", "positioning", "audience"]} className="w-full">
                
                {/* Visual Section: Positioning */}
                <AccordionItem value="positioning" className="border rounded-lg px-4 mb-4 bg-card overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-full text-blue-500 shrink-0">
                                <Target className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Positioning & Strategy</h4>
                                <p className="text-xs text-muted-foreground font-normal line-clamp-1">Mission, vision, and market stance</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        {/* Taglines */}
                        {positioning.taglines_slogans?.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Taglines & Slogans</h5>
                                <div className="flex flex-wrap gap-2">
                                    {positioning.taglines_slogans.map((tag: any, i: number) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1 text-xs break-words whitespace-normal text-left h-auto">
                                            {tag.phrase}
                                            {tag.frequency && parseInt(tag.frequency) > 1 && (
                                                <span className="ml-1.5 opacity-60 text-[10px] border-l border-foreground/20 pl-1.5">x{tag.frequency}</span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mission / Vision */}
                        {positioning.mission_vision_statements?.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    Mission & Vision
                                </h5>
                                <div className="grid gap-3">
                                    {positioning.mission_vision_statements.map((item: any, i: number) => (
                                         <div key={i} className="bg-muted/30 p-3 rounded-md border text-sm">
                                            {item.context && <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">{item.context}</Badge>}
                                            <p className="text-foreground/90 italic">"{item.statement}"</p>
                                            {item.source_url && (
                                                <Link href={`https://${item.source_url}`} target="_blank" className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 hover:underline truncate max-w-full">
                                                    <ExternalLink className="w-3 h-3" /> {item.source_url}
                                                </Link>
                                            )}
                                         </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Value Props */}
                        {positioning.value_propositions?.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-medium text-muted-foreground">Value Propositions</h5>
                                <div className="grid gap-2">
                                    {positioning.value_propositions.map((vp: any, i: number) => (
                                        <div key={i} className="text-sm flex gap-3 items-start bg-green-50/50 dark:bg-green-950/10 p-2.5 rounded-lg border border-green-100 dark:border-green-900/30">
                                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                            <span className="text-foreground/80">{vp.statement}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Visual Section: Narrative (Words) */}
                <AccordionItem value="narrative" className="border rounded-lg px-4 mb-4 bg-card overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                         <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                                <Megaphone className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Linguistic Analysis</h4>
                                <p className="text-xs text-muted-foreground font-normal line-clamp-1">Vocabulary and tone data points</p>
                            </div>
                         </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                             {/* Top Adjectives */}
                             <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Top Adjectives</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {(narrative.top_adjectives || []).slice(0, 15).map((item: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs font-normal">
                                            {item.word} <span className="ml-1.5 text-[10px] font-mono bg-muted px-1 rounded">{item.frequency || item.count}</span>
                                        </Badge>
                                    ))}
                                </div>
                             </div>

                             {/* Top Verbs */}
                             <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Top Verbs</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {(narrative.top_verbs || []).slice(0, 15).map((item: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs font-normal">
                                            {item.word} <span className="ml-1.5 text-[10px] font-mono bg-muted px-1 rounded">{item.frequency || item.count}</span>
                                        </Badge>
                                    ))}
                                </div>
                             </div>
                        </div>

                         {/* Value Laden Words */}
                         {narrative.value_laden_words?.length > 0 && (
                             <div className="space-y-2 pt-2 border-t">
                                <h5 className="text-sm font-medium text-muted-foreground mb-3">Value-Laden Words</h5>
                                <div className="flex flex-wrap gap-2">
                                    {(narrative.value_laden_words || []).slice(0, 20).map((item: any, i: number) => (
                                        <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                            {item.word}
                                            {item.frequency && <span className="ml-1.5 opacity-60 text-[10px]">x{item.frequency}</span>}
                                        </Badge>
                                    ))}
                                </div>
                             </div>
                         )}
                    </AccordionContent>
                </AccordionItem>
                
                {/* Visual Section: Emergent Themes */}
                 <AccordionItem value="themes" className="border rounded-lg px-4 mb-4 bg-card overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full text-amber-500 shrink-0">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Emergent Themes</h4>
                                <p className="text-xs text-muted-foreground font-normal line-clamp-1">Share of voice and topics</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                     <AccordionContent className="pt-2 pb-4 space-y-6">
                        {/* Theme Clusters with Progress Bars */}
                        {themes.theme_clusters?.length > 0 && (
                            <div className="space-y-6">
                                {themes.theme_clusters.map((cluster: any, idx: number) => {
                                    const percentage = Math.round(parseFloat(cluster.share_of_voice || '0') * 100);
                                    return (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <h5 className="text-sm font-medium">{cluster.theme_name}</h5>
                                                <span className="text-xs font-mono text-muted-foreground">{percentage}%</span>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                 {cluster.constituent_phrases?.map((phrase: string, pIdx: number) => (
                                                     <span key={pIdx} className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                                                         {phrase}
                                                     </span>
                                                 ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Frequent Noun Phrases */}
                        {themes.frequent_noun_phrases?.length > 0 && (
                            <div className="pt-4 border-t">
                                <h5 className="text-sm font-medium mb-3 text-muted-foreground">Frequent Topics</h5>
                                <div className="flex flex-wrap gap-2">
                                    {themes.frequent_noun_phrases.slice(0, 30).map((phrase: any, i: number) => {
                                        // Handle both string array and object array if schema varies
                                        const text = typeof phrase === 'string' ? phrase : phrase.phrase; 
                                        const count = typeof phrase === 'string' ? null : phrase.count || phrase.frequency;
                                        return (
                                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                {text} {count && <span className="ml-1 opacity-50">({count})</span>}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
                
                 {/* Visual Section: Audience */}
                 <AccordionItem value="audience" className="border rounded-lg px-4 mb-4 bg-card overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                         <div className="flex items-center gap-3">
                            <div className="bg-purple-500/10 p-2 rounded-full text-purple-500 shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Audience & CTAs</h4>
                                <p className="text-xs text-muted-foreground font-normal line-clamp-1">Targets, claims, and actions</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        {audience.target_audience_mentions?.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-medium text-muted-foreground">Target Audience</h5>
                                <div className="flex flex-wrap gap-2">
                                    {audience.target_audience_mentions.map((mention: any, i: number) => (
                                        <Badge key={i} variant="outline" className="pl-1 pr-2 py-1 flex gap-1.5 items-center">
                                            <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full p-0.5">
                                                <Users className="w-3 h-3" />
                                            </div>
                                            <span>{mention.phrase}</span>
                                            {mention.frequency && <span className="text-[10px] text-muted-foreground ml-0.5 font-mono">x{mention.frequency}</span>}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {ctas.top_ctas?.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Calls to Action (CTAs)</h5>
                                <div className="flex flex-wrap gap-2">
                                    {ctas.top_ctas.map((cta: any, i: number) => (
                                        <Badge key={i} className="bg-purple-600 hover:bg-purple-700 text-white border-0 py-1 px-3">
                                            {cta.cta_text || cta.text} 
                                            {(cta.frequency && parseInt(cta.frequency) > 1) && 
                                                <span className="ml-1.5 text-[10px] bg-white/20 px-1 rounded-sm">{cta.frequency}</span>
                                            }
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {proof.statistics_data?.length > 0 && (
                             <div className="space-y-3 pt-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Statistical Claims</h5>
                                <div className="grid gap-2">
                                     {proof.statistics_data.map((stat: any, i: number) => (
                                         <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-green-50/50 p-2.5 rounded border border-green-100 dark:bg-green-900/10 dark:border-green-900/30 gap-1">
                                             <span className="text-sm font-medium text-green-700 dark:text-green-400">{stat.claim}</span>
                                             <Badge variant="outline" className="w-fit text-[10px] text-muted-foreground border-green-200">{stat.context}</Badge>
                                         </div>
                                     ))}
                                </div>
                             </div>
                        )}

                        {proof.testimonials?.length > 0 && (
                             <div className="space-y-3 pt-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Testimonials</h5>
                                <div className="grid md:grid-cols-2 gap-3">
                                     {proof.testimonials.map((item: any, i: number) => (
                                         <div key={i} className="bg-muted/30 p-3 rounded-lg border text-sm flex flex-col justify-between h-full">
                                             <p className="italic text-muted-foreground mb-2">"{item.quote || item.text || item.statement}"</p>
                                             {item.attribution && (
                                                <div className="font-semibold text-xs flex items-center gap-1 mt-auto pt-2 border-t border-dashed border-border/50">
                                                    <Users className="w-3 h-3 text-muted-foreground" /> 
                                                    {item.attribution}
                                                </div>
                                             )}
                                         </div>
                                     ))}
                                </div>
                             </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="mt-8 pt-4 border-t">
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors w-fit p-2 rounded-md hover:bg-muted/50">
                        <Terminal className="h-4 w-4" />
                        <span className="font-medium">View Raw JSON</span>
                    </summary>
                    <div className="mt-2 bg-muted/50 rounded-lg overflow-hidden border">
                         <ScrollArea className="h-[400px] w-full">
                             <div className="p-4">
                                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
                             </div>
                         </ScrollArea>
                    </div>
                </details>
            </div>
        </div>
    );
}
