'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, Target, Users, Megaphone, CheckCircle, FileText, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AuditorResultViewerProps {
    data: any; // Auditor Output JSON
}

export function AuditorResultViewer({ data }: AuditorResultViewerProps) {
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                 <Card>
                    <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" /> Agent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate" title={data.model_used}>{data.model_used || 'Claude 4.5 Sonnet'}</div>
                         <p className="text-xs text-muted-foreground">Model Used</p>
                    </CardContent>
                </Card>
            </div>

            <Accordion type="multiple" defaultValue={["narrative", "themes", "positioning"]} className="w-full">
                
                {/* Visual Section: Positioning */}
                <AccordionItem value="positioning" className="border rounded-lg px-4 mb-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                                <Target className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Positioning & Strategy</h4>
                                <p className="text-xs text-muted-foreground font-normal">Mission, vision, and market stance</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        {/* We Are Statements */}
                        {positioning.we_are_statements?.length > 0 && (
                             <div className="space-y-3">
                                <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    "We Are" Statements
                                </h5>
                                <div className="grid gap-3">
                                    {positioning.we_are_statements.map((item: any, i: number) => (
                                         <div key={i} className="bg-blue-50/50 p-3 rounded-md border border-blue-100 text-sm italic dark:bg-blue-900/10 dark:border-blue-900/30">
                                            "{item.statement}"
                                         </div>
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
                                            <Badge variant="outline" className="mb-2 text-[10px] uppercase">{item.type || 'Statement'}</Badge>
                                            <p className="text-muted-foreground">"{item.statement}"</p>
                                         </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Value Props */}
                        {positioning.value_propositions?.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-medium text-muted-foreground">Value Propositions</h5>
                                <ul className="space-y-2">
                                    {positioning.value_propositions.map((vp: any, i: number) => (
                                        <li key={i} className="text-sm flex gap-2 items-start">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{vp.statement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Taglines */}
                        {positioning.taglines_slogans?.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Taglines</h5>
                                <div className="flex flex-wrap gap-2">
                                    {positioning.taglines_slogans.map((tag: any, i: number) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1 text-xs">
                                            {tag.text}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Visual Section: Narrative (Words) */}
                <AccordionItem value="narrative" className="border rounded-lg px-4 mb-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                         <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                <Megaphone className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Linguistic Analysis</h4>
                                <p className="text-xs text-muted-foreground font-normal">Vocabulary and tone data points</p>
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
                                            {item.word} <span className="ml-1 text-[10px] opacity-50">({item.count})</span>
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
                                            {item.word} <span className="ml-1 text-[10px] opacity-50">({item.count})</span>
                                        </Badge>
                                    ))}
                                </div>
                             </div>
                        </div>

                         {/* Value Laden Words */}
                         {narrative.value_laden_words?.length > 0 && (
                             <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Value-Laden Words</h5>
                                <div className="flex flex-wrap gap-2">
                                    {(narrative.value_laden_words || []).slice(0, 20).map((item: any, i: number) => (
                                        <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                            {item.word}
                                        </Badge>
                                    ))}
                                </div>
                             </div>
                         )}
                    </AccordionContent>
                </AccordionItem>
                
                {/* Visual Section: Emergent Themes */}
                 <AccordionItem value="themes" className="border rounded-lg px-4 mb-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full text-amber-500">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Emergent Themes</h4>
                                <p className="text-xs text-muted-foreground font-normal">Cluster analysis and share of voice</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                     <AccordionContent className="pt-2 pb-4 space-y-6">
                        {/* Theme Clusters with Progress Bars */}
                        {themes.theme_clusters?.length > 0 && (
                            <div className="space-y-4">
                                {themes.theme_clusters.map((cluster: any, idx: number) => {
                                    const percentage = Math.round(parseFloat(cluster.share_of_voice || '0') * 100);
                                    return (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <h5 className="text-sm font-medium">{cluster.theme_name}</h5>
                                                <span className="text-xs text-muted-foreground">{percentage}% SoV</span>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                            <p className="text-xs text-muted-foreground">
                                                {cluster.constituent_phrases?.join(", ")}
                                            </p>
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
                                    {themes.frequent_noun_phrases.slice(0, 25).map((phrase: any, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {phrase.phrase} <span className="ml-1 opacity-50">({phrase.count})</span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
                
                 {/* Visual Section: Audience */}
                 <AccordionItem value="audience" className="border rounded-lg px-4 mb-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-4">
                         <div className="flex items-center gap-3">
                            <div className="bg-purple-500/10 p-2 rounded-full text-purple-500">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-base">Audience & CTAs</h4>
                                <p className="text-xs text-muted-foreground font-normal">Targets, claims, and actions</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        {audience.target_audience_mentions?.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Target Audience Mentions</h5>
                                <ul className="grid gap-2">
                                    {audience.target_audience_mentions.map((mention: any, i: number) => (
                                        <li key={i} className="text-sm bg-muted/20 p-2 rounded border border-dashed flex items-center gap-2">
                                            <Users className="w-3 h-3 text-purple-500" />
                                            "{mention.phrase}"
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {ctas.top_ctas?.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Calls to Action</h5>
                                <div className="flex flex-wrap gap-2">
                                    {ctas.top_ctas.map((cta: any, i: number) => (
                                        <Badge key={i} variant="default" className="bg-purple-600 hover:bg-purple-700">
                                            {cta.text} {cta.frequency > 1 && <span className="ml-1 opacity-70">({cta.frequency})</span>}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {proof.statistics_data?.length > 0 && (
                             <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Statistical Claims</h5>
                                <div className="grid gap-2">
                                     {proof.statistics_data.map((stat: any, i: number) => (
                                         <div key={i} className="flex justify-between items-center bg-green-50/50 p-2 rounded border border-green-100 dark:bg-green-900/10 dark:border-green-900/30">
                                             <span className="text-sm font-medium text-green-700 dark:text-green-400">{stat.claim}</span>
                                             <span className="text-xs text-muted-foreground">{stat.context}</span>
                                         </div>
                                     ))}
                                </div>
                             </div>
                        )}

                        {proof.testimonials?.length > 0 && (
                             <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Testimonials</h5>
                                <div className="grid gap-2">
                                     {proof.testimonials.map((item: any, i: number) => (
                                         <div key={i} className="bg-muted/30 p-2 rounded border text-xs italic">
                                             "{item.quote || item.text || item.statement}"
                                             {item.attribution && <div className="mt-1 font-semibold not-italic text-right">- {item.attribution}</div>}
                                         </div>
                                     ))}
                                </div>
                             </div>
                        )}

                        {proof.case_studies?.length > 0 && (
                             <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Case Studies</h5>
                                <ul className="list-disc pl-4 space-y-1">
                                     {proof.case_studies.map((item: any, i: number) => (
                                         <li key={i} className="text-sm">
                                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                 {item.title || item.name || "Case Study"}
                                             </a>
                                             {item.summary && <p className="text-xs text-muted-foreground">{item.summary}</p>}
                                         </li>
                                     ))}
                                </ul>
                             </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
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
