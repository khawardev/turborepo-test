
export interface EngagementDetails {
  engagementName: string;
  clientName: string;
  industry?: string;
}

export interface SocialHandles {
  linkedin?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  socials: SocialHandles;
}

export interface ChannelSettings {
  enabled: boolean;
  lookbackDays: number; // Default 365
  maxPosts: number; // Default 200, min 50
  collectComments: boolean; // Default true
}

export interface ChannelScope {
  linkedin: ChannelSettings;
  youtube: ChannelSettings;
  instagram: ChannelSettings;
  twitter: ChannelSettings;
  facebook: ChannelSettings;
  tiktok: ChannelSettings;
}

export interface EngagementConfig {
  details: EngagementDetails;
  competitors: Competitor[];
  channels: ChannelScope;
}

// Agent & Phase Types

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'warning';

export interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  progress: number;
  message?: string;
  outputs?: string[]; // IDs or filenames of outputs
}

// --- Evidence Ledger Schema Types ---

export type SourceType = 'webpage' | 'social_post' | 'comment' | 'image';
export type SourceChannel = 'website' | 'linkedin' | 'youtube' | 'x' | 'instagram' | 'tiktok' | 'facebook';

export interface EvidenceItem {
    evidence_id: string; // Pattern: ^(E|VE|EC)[0-9]{5}$
    source_type: SourceType;
    source_channel: SourceChannel;
    source_entity: string;
    source_url: string; // URI
    source_timestamp: string | null; // ISO DateTime
    content_type: 'text' | 'image' | 'video' | 'mixed';
    excerpt?: string; // Max 500 chars
    full_content_uri: string;
    extraction_date: string; // ISO DateTime
    metadata?: Record<string, any>;
}

export interface EvidenceLedger {
    schema_version: "2.0.0";
    generated_at: string; // ISO DateTime
    run_id: string; // UUID
    tenant_id: string; // UUID
    evidence_count: number;
    evidence_by_type: {
        webpage: number;
        social_post: number;
        comment: number;
        image: number;
    };
    evidence_by_entity: Record<string, number>;
    evidence: EvidenceItem[];
}

// --- Corpus Manifest Schema Types ---

export interface WebsiteCoverage {
    pages_crawled: number;
    pages_excluded: number;
    total_words: number;
    total_images: number;
    exclusion_breakdown?: Record<string, number>;
    status: 'complete' | 'partial' | 'failed';
}

export interface ChannelCoverage {
    posts_collected: number;
    comments_collected: number;
    total_engagement: number;
    status: 'complete' | 'partial' | 'no_presence' | 'private' | 'failed';
}

export interface CoverageGap {
    gap_id: string; // ^GAP[0-9]{3}$
    entity: string;
    channel: string;
    description: string;
    severity: 'critical' | 'significant' | 'minor';
    impact: string;
    mitigation: string;
}

export interface DataQualityFlag {
    flag_id: string; // ^FLAG[0-9]{3}$
    entity: string;
    channel: string;
    issue: string;
    affected_metrics: string[];
    handling: string;
}

export interface CorpusAdequacy {
    overall: 'adequate' | 'marginal' | 'inadequate';
    notes: string;
    minimum_thresholds: {
        website_pages: number;
        social_posts_per_channel: number;
        comments_per_channel: number;
    };
    entities_below_threshold: string[];
}

export interface CorpusManifest {
    schema_version: "2.0.0";
    generated_at: string; // ISO DateTime
    run_id: string; // UUID
    collection_window: {
        collection_date: string;
        social_lookback_start: string;
        social_lookback_end: string;
        social_lookback_days: number;
    };
    coverage_summary: {
        entities_collected: string[];
        channels_collected: string[];
        website: Record<string, WebsiteCoverage>;
        social: Record<string, Record<string, ChannelCoverage>>;
    };
    coverage_gaps: CoverageGap[];
    data_quality_flags: DataQualityFlag[];
    corpus_adequacy: CorpusAdequacy;
    status?: 'PASS' | 'WARN' | 'FAIL'; // Computed property helper, not strictly in schema but useful for UI
}


// --- Gate Output Schema Types ---

export interface GateResult {
    gate_id: string;
    name: string;
    status: 'pass' | 'warn' | 'fail';
    messages?: string[];
    affected_files?: string[];
}

export interface GateOutputs {
    schema_version: "2.0.0";
    generated_at: string;
    engagement_id: string;
    overall_status: 'pass' | 'warn' | 'fail';
    gates: GateResult[];
}
