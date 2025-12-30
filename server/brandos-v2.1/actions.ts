
'use server'

import { AgentState, CorpusManifest, EngagementConfig, EvidenceLedger, GateOutputs, EvidenceItem, CoverageGap, DataQualityFlag, CorpusAdequacy, WebsiteCoverage, ChannelCoverage } from '@/lib/brandos-v2.1/types';
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

// --- MOCK GENERATORS ---

function generateMockLedger(engagementId: string, config: EngagementConfig | null): EvidenceLedger {
    const evidenceItems: EvidenceItem[] = [];
    const evidenceByType = { webpage: 0, social_post: 0, comment: 0, image: 0 };
    const evidenceByEntity: Record<string, number> = {};

    const entities = config ? [config.details.clientName, ...config.competitors.map(c => c.name)] : ['AcmeCorp', 'CompetitorX'];
    
    let count = 0;
    
    entities.forEach(entity => {
        let entityCount = 0;

        // 1. Webpage Evidence
        const webCount = 2; 
        for (let i = 0; i < webCount; i++) {
            evidenceItems.push({
                evidence_id: `E${10000 + count}`,
                source_type: 'webpage',
                source_channel: 'website',
                source_entity: entity,
                source_url: `https://${entity.toLowerCase().replace(/\s/g, '')}.com/about`,
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

        // 2. Social Post Evidence (LinkedIn)
        const socialCount = 3;
        for (let i = 0; i < socialCount; i++) {
            evidenceItems.push({
                evidence_id: `E${10000 + count}`,
                source_type: 'social_post',
                source_channel: 'linkedin',
                source_entity: entity,
                source_url: `https://linkedin.com/post/${entity}-update-${i}`,
                source_timestamp: new Date(Date.now() - 43200000 * (i + 1)).toISOString(),
                content_type: 'mixed',
                excerpt: `We are thrilled to announce our Q3 results! Revenue is up 20% YoY. A huge thank you to our dedicated team and loyal customers. #Growth #Innovation`,
                full_content_uri: `s3://evidence-bucket/runs/${engagementId}/${entity}/li-${i}.json`,
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
