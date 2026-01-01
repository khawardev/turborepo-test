
'use server'

import { AgentState, CorpusManifest, EngagementConfig, EvidenceLedger, GateOutputs, EvidenceItem, CoverageGap, DataQualityFlag, CorpusAdequacy, WebsiteCoverage, ChannelCoverage, UrlExtraction, PostExtraction, WebsiteVerbalBedrock, SocialChannelBedrock, BrandPlatform, BrandArchetype, BrandVoice, PositioningLandscape, ReportArtifact } from '@/lib/brandos-v2.1/types';
import { revalidatePath } from 'next/cache';

// Mock storage
let activeEngagement: EngagementConfig | null = null;
let activePhaseStatus: AgentState[] = [];

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;

export async function createEngagementAction(config: EngagementConfig): Promise<{ success: boolean; engagementId: string; error?: string }> {
  try {
    console.log('Creating Engagement:', config);
    activeEngagement = config;
    
    // Simulate DB delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const engagementId = `eng-${Date.now()}`;
    return { success: true, engagementId };
  } catch (error) {
    console.error('Failed to create engagement:', error);
    return { success: false, engagementId: '', error: 'Failed to create engagement' };
  }
}

export async function startPhase0Action(engagementId: string) {
  // Initialize agents
  activePhaseStatus = [
    { id: 'scrapers', name: 'Data Collection Swarm', status: 'running', progress: 0 },
    { id: 'sa-00', name: 'SA-00 Evidence Ledger Builder', status: 'idle', progress: 0 }
  ];

  revalidatePath('/dashboard/brandos-v2.1/phase-0');
  return { success: true };
}

export async function pollPhase0StatusAction(engagementId: string): Promise<{ 
    agents: AgentState[], 
    ledger?: EvidenceLedger, 
    manifest?: CorpusManifest,
    gateResults?: GateOutputs 
}> {
  // Simulate progress
  const scrapersIndex = activePhaseStatus.findIndex(a => a.id === 'scrapers');
  if (scrapersIndex > -1) {
    const scraper = activePhaseStatus[scrapersIndex];
    if (scraper.status === 'running') {
      scraper.progress = Math.min(scraper.progress + 15, 100);
      if (scraper.progress >= 100) {
        scraper.status = 'completed';
        // Trigger SA-00
        const sa00Index = activePhaseStatus.findIndex(a => a.id === 'sa-00');
        if (sa00Index > -1) {
          activePhaseStatus[sa00Index].status = 'running';
        }
      }
    }
  }

  const sa00Index = activePhaseStatus.findIndex(a => a.id === 'sa-00');
  if (sa00Index > -1) {
    const sa00 = activePhaseStatus[sa00Index];
    if (sa00.status === 'running') {
      sa00.progress = Math.min(sa00.progress + 25, 100);
      if (sa00.progress >= 100) {
        sa00.status = 'completed';
      }
    }
  }
  
  // If SA-00 complete, return mock data
  let ledger, manifest, gateResults;
  if (activePhaseStatus.find(a => a.id === 'sa-00')?.status === 'completed') {
    ledger = generateMockLedger(engagementId, activeEngagement);
    manifest = generateMockManifest(engagementId, activeEngagement, ledger);
    gateResults = generateMockGate0(engagementId, manifest);
  }


  return { agents: activePhaseStatus, ledger, manifest, gateResults };
}

// --- PHASE 1 ACTIONS ---

export async function startPhase1Action(engagementId: string) {
  // Initialize agents for Phase 1
  activePhaseStatus = [
    { id: 'oi-01', name: 'OI-01 Website Verbal Extractor', status: 'running', progress: 0 },
    { id: 'oi-02', name: 'OI-02 Visual Extractor', status: 'running', progress: 0 },
    { id: 'oi-03', name: 'OI-03 Social Post Extractor', status: 'running', progress: 0 },
    { id: 'comp-01', name: 'COMP-01 Website Verbal Compiler', status: 'idle', progress: 0 },
    { id: 'comp-03', name: 'COMP-03 Social Channel Compiler', status: 'idle', progress: 0 }
  ];

  revalidatePath('/dashboard/brandos-v2.1/phase-1');
  return { success: true };
}

export async function pollPhase1StatusAction(engagementId: string): Promise<{
    agents: AgentState[],
    extractions?: { url: UrlExtraction[], posts: PostExtraction[] },
    bedrocks?: { website: WebsiteVerbalBedrock, social: SocialChannelBedrock },
    gate1Results?: GateOutputs,
    gate2Results?: GateOutputs
}> {
    
    // Simulate Extraction Progress
    ['oi-01', 'oi-02', 'oi-03'].forEach(id => {
        const agent = activePhaseStatus.find(a => a.id === id);
        if (agent && agent.status === 'running') {
            agent.progress = Math.min(agent.progress + 20, 100);
            if (agent.progress >= 100) agent.status = 'completed';
        }
    });

    // Gate 1 Check (Runs after extractions)
    const extractionsDone = ['oi-01', 'oi-02', 'oi-03'].every(id => activePhaseStatus.find(a => a.id === id)?.status === 'completed');
    let gate1Results;

    if (extractionsDone) {
        gate1Results = generateMockGate1(engagementId);
        
        // Trigger Compilers
        ['comp-01', 'comp-03'].forEach(id => {
            const agent = activePhaseStatus.find(a => a.id === id);
            if (agent && agent.status === 'idle') agent.status = 'running';
        });
    }

    // Simulate Compilation Progress
    ['comp-01', 'comp-03'].forEach(id => {
        const agent = activePhaseStatus.find(a => a.id === id);
        if (agent && agent.status === 'running') {
            agent.progress = Math.min(agent.progress + 20, 100);
            if (agent.progress >= 100) agent.status = 'completed';
        }
    });

    // Gate 2 Check (Runs after compilations)
    const compilationsDone = ['comp-01', 'comp-03'].every(id => activePhaseStatus.find(a => a.id === id)?.status === 'completed');
    let gate2Results, extractions, bedrocks;

    if (compilationsDone) {
        gate2Results = generateMockGate2(engagementId);
        extractions = generateMockExtractions(engagementId);
        bedrocks = generateMockBedrocks(engagementId);
    }

    return { agents: activePhaseStatus, extractions, bedrocks, gate1Results, gate2Results };
}

// --- PHASE 2 ACTIONS ---

export async function startPhase2Action(engagementId: string) {
    // Initialize agents for Phase 2
    activePhaseStatus = [
      { id: 'oi-11', name: 'OI-11 The Archaeologist', status: 'running', progress: 0 },
      { id: 'oi-13', name: 'OI-13 The Strategist', status: 'idle', progress: 0 }, // Wait for OI-11
      { id: 'rpt-01', name: 'RPT-01 Report Generator', status: 'idle', progress: 0 }
    ];
  
    revalidatePath('/dashboard/brandos-v2.1/phase-2');
    return { success: true };
}

export async function pollPhase2StatusAction(engagementId: string): Promise<{
    agents: AgentState[],
    synthesis?: { platform: BrandPlatform, archetype: BrandArchetype },
    reports?: ReportArtifact[],
    gate3Results?: GateOutputs,
    gate4Results?: GateOutputs
}> {
    
    // Simulate Synthesis (OI-11)
    const archaeologist = activePhaseStatus.find(a => a.id === 'oi-11');
    if (archaeologist && archaeologist.status === 'running') {
        archaeologist.progress = Math.min(archaeologist.progress + 15, 100);
        if (archaeologist.progress >= 100) {
            archaeologist.status = 'completed';
            // Trigger Strategist and Report
            const strat = activePhaseStatus.find(a => a.id === 'oi-13');
            if (strat) strat.status = 'running';
             const rpt = activePhaseStatus.find(a => a.id === 'rpt-01');
            if (rpt) rpt.status = 'running';
        }
    }

    // Simulate OI-13 and RPT-01
    ['oi-13', 'rpt-01'].forEach(id => {
        const agent = activePhaseStatus.find(a => a.id === id);
        if (agent && agent.status === 'running') {
            agent.progress = Math.min(agent.progress + 20, 100);
            if (agent.progress >= 100) agent.status = 'completed';
        }
    });

    const synthesisDone = activePhaseStatus.find(a => a.id === 'oi-11')?.status === 'completed';
    const allDone = activePhaseStatus.every(a => a.status === 'completed');

    let gate3Results, gate4Results, synthesis, reports;

    if (synthesisDone) {
        gate3Results = generateMockGate3(engagementId);
        synthesis = generateMockSynthesis(engagementId);
    }

    if (allDone) {
        gate4Results = generateMockGate4(engagementId);
        reports = generateMockReports(engagementId);
    }

    return { agents: activePhaseStatus, synthesis, reports, gate3Results, gate4Results };
}



// --- FLOW E & F ACTIONS ---

export async function getComparativeDataAction(engagementId: string): Promise<PositioningLandscape | null> {
    // Return mock comparative data
    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        matrix: [
            { entity: "Client", positioning: "Secure AI Leader", market_share_proxy: 0.15 },
            { entity: "Competitor A", positioning: "Legacy Enterprise", market_share_proxy: 0.45 },
            { entity: "Competitor B", positioning: "Cheap Alternative", market_share_proxy: 0.20 }
        ]
    };
}

export async function generateExportPackageAction(engagementId: string): Promise<{ downloadUrl: string, files: string[] }> {
    // Simulate BRIDGE-01 execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        downloadUrl: `https://brandos-artifacts.s3.amazonaws.com/${engagementId}/brandos_pack_v2.1.zip`,
        files: [
            "bam_input_pack.json",
            "emergent_brand_report.pdf",
            "visual_identity_report.pdf",
            "gate_outputs.json"
        ]
    };
}

// --- MOCK GENERATORS ---


function generateMockLedger(engagementId: string, config: EngagementConfig | null): EvidenceLedger {
    const evidenceItems: EvidenceItem[] = [];
    const evidenceByType = { webpage: 0, social_post: 0, comment: 0, image: 0 };
    const evidenceByEntity: Record<string, number> = {};

    const entities = config ? [config.details.clientName, ...config.competitors.map(c => c.name)] : ['AcmeCorp', 'CompetitorX'];
    
    let count = 0;
    
    entities.forEach(entity => {
        let entityCount = 0;
        const isClient = config && entity === config.details.clientName;
        const clientWebsite = isClient ? config.details.clientWebsite : null;
        const clientSocials = isClient ? config.details.clientSocials : null;

        // 1. Webpage Evidence
        const webCount = 2; 
        for (let i = 0; i < webCount; i++) {
            const baseUrl = clientWebsite || `https://${entity.toLowerCase().replace(/\s/g, '')}.com`;
            evidenceItems.push({
                evidence_id: `E${10000 + count}`,
                source_type: 'webpage',
                source_channel: 'website',
                source_entity: entity,
                source_url: `${baseUrl.replace(/\/$/, '')}/about`,
                source_timestamp: new Date(Date.now() - 86400000 * (i + 1)).toISOString(),
                content_type: 'text',
                excerpt: `The new AI-driven platform promises to revolutionize how enterprises handle data security, with a 99.9% reduction in false positives observed during the beta phase.`,
                full_content_uri: `s3://evidence-bucket/runs/${engagementId}/${entity}/web-${i}.html`,
                extraction_date: new Date().toISOString(),
                metadata: {
                    author: "Editorial Team",
                    word_count: 850 + (i * 100),
                    sentiment: {
                        polarity: { score: 0.85, label: "positive" },
                        emotional_tone: { primary: "professional", intensity: "high" },
                        subjectivity: { score: 0.2, label: "objective" }
                    }
                }
            });
            count++;
            entityCount++;
            evidenceByType.webpage++;
        }

        // 2. Social Post Evidence (Dynamic based on settings)
        const channelsToGen = ['linkedin', 'twitter', 'instagram'];
        
        channelsToGen.forEach((channel) => {
             // Only generate if we have a handle or it's a competitor (mock)
             const handle = clientSocials ? (clientSocials as any)[channel] : null;
             if (isClient && !handle) return; 

             const socialCount = 2; // Generate 2 posts per channel
             for (let i = 0; i < socialCount; i++) {
                const socialUrl = handle 
                    ? `https://${channel}.com/${handle.replace('@', '')}/status/${1000+i}`
                    : `https://${channel}.com/${entity}/status/${1000+i}`;

                evidenceItems.push({
                    evidence_id: `E${10000 + count}`,
                    source_type: 'social_post',
                    source_channel: channel as any,
                    source_entity: entity,
                    source_url: socialUrl,
                    source_timestamp: new Date(Date.now() - 43200000 * (i + 1)).toISOString(),
                    content_type: 'mixed',
                    excerpt: `We are thrilled to announce our Q3 results! #Growth #Innovation`,
                    full_content_uri: `s3://evidence-bucket/runs/${engagementId}/${entity}/${channel}-${i}.json`,
                    extraction_date: new Date().toISOString(),
                    metadata: {
                        likes: 450 + (i * 50),
                        shares: 32 + i,
                        sentiment: {
                            polarity: { score: 0.95, label: "very_positive" },
                            emotional_tone: { primary: "enthusiastic", intensity: "high" },
                            subjectivity: { score: 0.8, label: "subjective" }
                        }
                    }
                });
                count++;
                entityCount++;
                evidenceByType.social_post++;
             }
        });

        // 3. Comment Evidence (Negative example for variety)
        evidenceItems.push({
            evidence_id: `EC${40000 + count}`,
            source_type: 'comment',
            source_channel: 'facebook',
            source_entity: `${entity}_User`,
            source_url: `https://facebook.com/brand/posts/123?comment_id=${count}`,
            source_timestamp: new Date(Date.now() - 3600000).toISOString(),
            content_type: 'text',
            excerpt: "I've been waiting for support to email me back for 3 weeks. This is unacceptable service.",
            full_content_uri: `s3://evidence-bucket/runs/${engagementId}/${entity}/comment-${count}.json`,
            extraction_date: new Date().toISOString(),
            metadata: {
                parent_post_id: "888222111",
                sentiment: {
                    polarity: { score: -0.9, label: "very_negative" },
                    emotional_tone: { primary: "frustrated", intensity: "high" },
                    subjectivity: { score: 0.9, label: "subjective" }
                }
            }
        });
        count++;
        entityCount++;
        evidenceByType.comment++;

        evidenceByEntity[entity] = entityCount;
    });

    // Add a standalone Image evidence (Visual Analysis)
    evidenceItems.push({
        evidence_id: `VE05002`,
        source_type: 'image',
        source_channel: 'instagram',
        source_entity: 'LifestyleInfluencer',
        source_url: "https://instagram.com/p/CwXyZ123",
        source_timestamp: new Date(Date.now() - 7200000).toISOString(),
        content_type: 'image',
        excerpt: "[Visual Content Analysis]: Image contains the product placed on a marble table next to a coffee cup. Lighting is bright/morning sun. Logo is clearly visible.",
        full_content_uri: `s3://evidence-bucket/runs/${engagementId}/visual/VE05002.jpg`,
        extraction_date: new Date().toISOString(),
        metadata: {
            visual_tags: ["coffee", "morning", "lifestyle", "product_placement"],
            sentiment: {
                polarity: { score: 0.5, label: "positive" },
                emotional_tone: { primary: "neutral", intensity: "low" },
                subjectivity: { score: 0.1, label: "objective" }
            }
        }
    });
    evidenceByType.image++;
    // Add to first entity count for simplicity
    evidenceByEntity[entities[0]] = (evidenceByEntity[entities[0]] || 0) + 1;


    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        run_id: crypto.randomUUID(),
        tenant_id: "tenant-mock-123",
        evidence_count: evidenceItems.length,
        evidence_by_type: evidenceByType,
        evidence_by_entity: evidenceByEntity,
        evidence: evidenceItems
    };
}

function generateMockManifest(engagementId: string, config: EngagementConfig | null, ledger: EvidenceLedger): CorpusManifest {
    const entities = config ? [config.details.clientName, ...config.competitors.map(c => c.name)] : ['AcmeCorp', 'CompetitorX'];
    const runId = ledger.run_id;

    // Mock Coverage Data
    const websiteCoverage: Record<string, WebsiteCoverage> = {};
    const socialCoverage: Record<string, Record<string, ChannelCoverage>> = {};

    entities.forEach((entity, idx) => {
        // Vary data slightly
        const isClient = idx === 0;
        
        websiteCoverage[entity] = {
            pages_crawled: isClient ? 150 : 85,
            pages_excluded: isClient ? 12 : 5,
            total_words: isClient ? 85000 : 42000,
            total_images: isClient ? 320 : 150,
            status: isClient ? 'complete' : 'partial',
            exclusion_breakdown: isClient ? { "robots_txt": 10, "404_error": 2 } : { "duplicate_content": 5 }
        };

        socialCoverage[entity] = {
            linkedin: {
                posts_collected: isClient ? 25 : 0,
                comments_collected: isClient ? 150 : 0,
                total_engagement: isClient ? 4500 : 0,
                status: isClient ? 'complete' : 'no_presence'
            },
            x: {
                posts_collected: 110,
                comments_collected: 300,
                total_engagement: 8900,
                status: 'complete'
            }, 
            // Add a channel for CompetitorX
            ...( !isClient ? {
                instagram: {
                    posts_collected: 40,
                    comments_collected: 600,
                    total_engagement: 12000,
                    status: 'complete'
                }
            } : {})
        };
    });

    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        run_id: runId,
        collection_window: {
            collection_date: new Date().toISOString(),
            social_lookback_start: new Date(Date.now() - 30 * 86400000).toISOString(),
            social_lookback_end: new Date().toISOString(),
            social_lookback_days: 30
        },
        coverage_summary: {
            entities_collected: entities,
            channels_collected: ["website", "linkedin", "x", "instagram", "youtube"],
            website: websiteCoverage,
            social: socialCoverage
        },
        coverage_gaps: [
            {
                gap_id: "GAP001",
                entity: entities.length > 1 ? entities[1] : "CompetitorX",
                channel: "website",
                description: "Unable to crawl 'pricing' subdomain due to strict firewall rules.",
                severity: "significant",
                impact: "Missing pricing strategy data for analysis.",
                mitigation: "Manual intake of pricing PDF scheduled."
            },
            {
                gap_id: "GAP002",
                entity: entities[0],
                channel: "tiktok",
                description: "Brand has no official account or presence.",
                severity: "minor",
                impact: "Cannot analyze short-form video engagement.",
                mitigation: "None required (strategic decision)."
            }
        ],
        data_quality_flags: [
            {
                flag_id: "FLAG001",
                entity: entities[0],
                channel: "x",
                issue: "Rate limiting encountered during comment extraction.",
                affected_metrics: ["audience_sentiment_depth", "comment_volume"],
                handling: "Capped collection at 300 comments; statistical sampling applied."
            },
            {
                flag_id: "FLAG002",
                entity: entities.length > 1 ? entities[1] : "CompetitorX",
                channel: "website",
                issue: "High ratio of non-text content (images) without alt tags.",
                affected_metrics: ["keyword_density", "accessibility_score"],
                handling: "Visual analysis module triggered for image content extraction."
            }
        ],
        corpus_adequacy: {
            overall: "adequate",
            notes: "Sufficient data collected across primary channels to support confidence interval of 95%. Website coverage for CompetitorX is partial but core pages are present.",
            minimum_thresholds: {
                website_pages: 50,
                social_posts_per_channel: 10,
                comments_per_channel: 50
            },
            entities_below_threshold: []
        }
    };
}

function generateMockGate0(engagementId: string, manifest: CorpusManifest): GateOutputs {
    // Logic: Pass if adequate, warn if marginal/inadequate but passable
    const gateStatus = manifest.corpus_adequacy.overall === 'adequate' ? 'pass' : 'warn';

    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        engagement_id: engagementId,
        overall_status: gateStatus,
        gates: [
            {
                gate_id: "GATE-01",
                name: "Corpus Volume",
                status: gateStatus,
                messages: [
                    "Sufficient volume across all targets (95% CI suppported)",
                    `Website pages: ${Object.values(manifest.coverage_summary.website).reduce((a, b) => a + b.pages_crawled, 0)} collected`
                ],
                affected_files: ["corpus_manifest.json"]
            },
            {
                gate_id: "GATE-02",
                name: "Channel Diversity",
                status: "pass", // We hardcode pass here for the sample
                messages: [
                    "Primary channels (Website, LinkedIn, X) present for key entities"
                ],
                affected_files: ["corpus_manifest.json"]
            },
            {
                gate_id: "GATE-03",
                name: "Data Quality",
                status: "warn",
                messages: manifest.data_quality_flags.map(f => `FLAG: ${f.issue}`),
                affected_files: ["evidence_ledger.json"]
            }
        ]
    };
}

function generateMockGate1(engagementId: string): GateOutputs {
    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        engagement_id: engagementId,
        overall_status: 'pass',
        gates: [
            {
                gate_id: "GATE-1-1",
                name: "Extraction Quality",
                status: 'pass',
                messages: ["All URLs extracted with >95% success rate"],
                affected_files: ["url_extractions"]
            }
        ]
    };
}

function generateMockGate2(engagementId: string): GateOutputs {
    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        engagement_id: engagementId,
        overall_status: 'pass',
        gates: [
            {
                gate_id: "GATE-2-1",
                name: "Compilation Integrity",
                status: 'pass',
                messages: ["Bedrocks aggregated successfully"],
                affected_files: ["bedrocks"]
            }
        ]
    };
}

function generateMockExtractions(engagementId: string): { url: UrlExtraction[], posts: PostExtraction[] } {
    return {
        url: [
            {
                url_id: "URL-001",
                evidence_id: "E10001",
                url: "https://example.com/about",
                page_type: "about",
                text_content: "About us...",
                metadata: { word_count: 500 }
            }
        ],
        posts: []
    };
}

function generateMockBedrocks(engagementId: string): { website: WebsiteVerbalBedrock, social: SocialChannelBedrock } {
    return {
        website: {
            schema_version: "2.0.0",
            generated_at: new Date().toISOString(),
            entity: "Client",
            channel: "website",
            corpus_summary: { pages_analyzed: 50, total_words: 25000 },
            linguistic_metrics: { avg_sentence_length: 15, reading_level_grade: 10 },
            lexical_frequency: { top_nouns: [{ word: "innovation", count: 120 }] },
            key_themes: [{ theme: "Sustainability", frequency: 45 }]
        },
        social: {
            schema_version: "2.0.0",
            generated_at: new Date().toISOString(),
            entity: "Client",
            channel: "linkedin",
            corpus_summary: { post_count: 120 },
            content_mix: { by_format: [{ format: "video", share: 0.4 }] },
            sentiment_summary: { avg_polarity_score: 0.8 },
            themes: [{ theme: "Leadership", share: 0.3 }]
        }
    };
}

function generateMockGate3(engagementId: string): GateOutputs {
    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        engagement_id: engagementId,
        overall_status: 'warn',
        gates: [
            {
                gate_id: "gate_3",
                name: "Synthesis Credibility",
                status: 'warn',
                messages: [
                    "Confidence Summary: Avg 0.78, Min 0.52",
                    "Evidence Density: 0.92 (Good)",
                    "WARN: Vision confidence 0.52 (Threshold: 0.60) - Limited future-oriented content",
                    "PASS: Mission confidence 0.90",
                    "PASS: Values confidence 0.92"
                ]
            }
        ]
    };
}

function generateMockGate4(engagementId: string): GateOutputs {
    return {
        schema_version: "2.0.0",
        generated_at: new Date().toISOString(),
        engagement_id: engagementId,
        overall_status: 'pass',
        gates: [
            {
                gate_id: "gate_4",
                name: "Report Quality",
                status: 'pass',
                messages: [
                    "PASS: Structural Completeness (All sections present)",
                    "PASS: Evidence Citation Density (1.2 per 200 words)",
                    "PASS: No bullet points in narrative sections",
                    "PASS: Numbers match JSON source of truth"
                ]
            }
        ]
    };
}

function generateMockSynthesis(engagementId: string): { platform: BrandPlatform, archetype: BrandArchetype } {
    return {
        platform: {
            schema_version: "2.0.0",
            generated_at: new Date().toISOString(),
            entity: "Client",
            mission: { 
                synthesized: "To revolutionize the industry through secure AI adoption.", 
                confidence: 0.9,
                evidence_ids: ["E00101", "E00234"]
            },
            vision: { 
                synthesized: "A world where data is secure and intelligence is accessible.", 
                confidence: 0.85, 
                evidence_ids: ["E00342"]
            },
            values: { 
                synthesized: [
                    { value: "Integrity", description: "Doing the right thing, always.", confidence: 0.95, evidence_ids: ["E00991"] },
                    { value: "Innovation", description: "Pushing boundaries of what is possible.", confidence: 0.88, evidence_ids: ["E00992"] },
                    { value: "Security", description: "Protecting what matters most.", confidence: 0.92, evidence_ids: ["E00993"] }
                ] 
            },
            positioning: { 
                synthesized: "The leader in secure AI for enterprise.", 
                confidence: 0.88,
                evidence_ids: ["E00551", "E00552"]
            },
            tagline: { synthesized_alternative: "Secure AI for Everyone." },
            key_themes: [
                { name: "Safety First", score: 0.35, evidence_ids: ["E00111", "E00112"] },
                { name: "Enterprise Scale", score: 0.25, evidence_ids: ["E00113"] },
                { name: "Future Ready", score: 0.20, evidence_ids: ["E00114"] },
                { name: "Compliance", score: 0.15, evidence_ids: ["E00115"] }
            ]
        },
        archetype: {
            schema_version: "2.0.0",
            generated_at: new Date().toISOString(),
            entity: "Client",
            primary_archetype: { name: "The Sage", score: 0.8, description: "Driven by the search for truth and knowledge." },
            secondary_archetype: { name: "The Ruler", score: 0.15, description: "Focused on control and stability." }
        }
    };
}

function generateMockReports(engagementId: string): ReportArtifact[] {
    return [
        {
            report_type: "Emergent Brand Report",
            entity: "Client",
            generated_at: new Date().toISOString(),
            markdown_content: `# Emergent Brand Strategy Report
**Client:** Client Inc.
**Date:** ${new Date().toLocaleDateString()}
**Confidence Score:** High (0.87)

## 1. Executive Summary
The synthesis of over 850 artifacts reveals a brand positioned as a "Secure AI Leader." While the stated mission emphasizes innovation, the *emergent* market perception is heavily anchored in "reliability" and "trust."

## 2. Brand Platform (Synthesized)
* **Mission:** To revolutionize the industry through secure AI adoption.
* **Vision:** A world where data is secure and intelligence is accessible.
* **Core Values:** Integrity, Innovation, Security.

## 3. Archetypal Analysis
The brand exhibits a primary **Sage** archetype (seeking truth/wisdom) with secondary **Ruler** traits (exercising control/stability). This combination creates a voice that is authoritative yet educational.

## 4. Strategic Recommendations
1. **Capitalize on Trust:** Your "security" perception is a massive differentiator. Lean into it.
2. **Humanize the Voice:** The "Ruler" traits can feel cold. Incorporate more "Creator" energy in social channels.
            `
        },
        {
            report_type: "Visual Competitive Analysis",
            entity: "Cross-Entity",
            generated_at: new Date().toISOString(),
            markdown_content: `# Visual Competitive Landscape

## Overview
Visual analysis of 1,200+ images across Client and 3 Competitors identifies distinct visual territories.

## Territories
* **Client:** "Industrial Blue" - Heavy use of cool tones, machinery, and posed engineering shots.
* **Competitor A:** "Lifestyle Warmth" - Focus on end-users, warm lighting, natural settings.
* **Competitor B:** "Abstract Tech" - Stock imagery, neon gradients, minimal human presence.

## Gap Analysis
There is a clear whitespace for a "Human-Centric High Tech" visual style that combines the reliability of the Client's industry focus with the warmth of Competitor A.
            `
        }
    ];
}

