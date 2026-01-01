
export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  phase: string;
  trigger: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
}

export const BRAND_OS_AGENTS: Record<string, AgentMetadata> = {
  // --- PHASE 0 ---
  "sa-00": {
    id: "SA-00",
    name: "Evidence Ledger Builder",
    role: "The Librarian",
    description: "Catalogs all evidence with unique IDs for citation.",
    phase: "Phase 0: Configuration & Setup",
    trigger: "After all scrapers complete",
    inputs: [
      "website_crawl_{entity}.json",
      "social_posts_{entity}_{channel}.json",
      "social_comments_{entity}_{channel}.json",
      "images_{entity}_{channel}.json"
    ],
    outputs: [
      "evidence_ledger.json",
      "corpus_manifest.json"
    ],
    dependencies: []
  },

  // --- PHASE 1: EXTRACTION ---
  "oi-01": {
    id: "OI-01",
    name: "Website Verbal Extractor",
    role: "The Auditor",
    description: "Forensic linguistic extraction from website pages.",
    phase: "Phase 1: Extraction",
    trigger: "After SA-00 completes",
    inputs: ["Single webpage content + evidence_id"],
    outputs: ["url_extraction_{id}.json"],
    dependencies: ["SA-00"]
  },
  "oi-02": {
    id: "OI-02",
    name: "Visual Extractor",
    role: "The Curator",
    description: "Image-by-image visual analysis.",
    phase: "Phase 1: Extraction",
    trigger: "After SA-00 completes",
    inputs: ["Single image + evidence_id"],
    outputs: ["image_extraction_{id}.json"],
    dependencies: ["SA-00"]
  },
  "oi-03": {
    id: "OI-03",
    name: "Social Post Extractor",
    role: "The Analyst",
    description: "Post-level social media extraction.",
    phase: "Phase 1: Extraction",
    trigger: "After SA-00 completes",
    inputs: ["Single social post + evidence_id"],
    outputs: ["post_extraction_{id}.json"],
    dependencies: ["SA-00"]
  },
  "oi-10": {
    id: "OI-10",
    name: "Fact Base Extractor",
    role: "The Fact Checker",
    description: "Extract verifiable proof points.",
    phase: "Phase 1: Extraction",
    trigger: "After OI-01 completes",
    inputs: ["All url_extraction files for entity"],
    outputs: ["fact_base_{entity}.json"],
    dependencies: ["OI-01"]
  },

  // --- PHASE 1: COMPILATION ---
  "comp-01": {
    id: "COMP-01",
    name: "Website Verbal Compiler",
    role: "The Synthesizer",
    description: "Aggregate URL extractions into website bedrock.",
    phase: "Phase 1: Compilation",
    trigger: "After all OI-01 for entity complete",
    inputs: ["All url_extraction_{id}.json for entity"],
    outputs: ["{entity}_website_verbal_bedrock.json"],
    dependencies: ["OI-01"]
  },
  "comp-02": {
    id: "COMP-02",
    name: "Website Visual Compiler",
    role: "The Art Director",
    description: "Aggregate image extractions into visual bedrock.",
    phase: "Phase 1: Compilation",
    trigger: "After all OI-02 for entity website complete",
    inputs: ["All image_extraction_{id}.json from website"],
    outputs: ["{entity}_website_visual_bedrock.json"],
    dependencies: ["OI-02"]
  },
  "comp-03": {
    id: "COMP-03",
    name: "Social Channel Compiler",
    role: "The Channel Manager",
    description: "Aggregate post extractions into channel bedrock.",
    phase: "Phase 1: Compilation",
    trigger: "After all OI-03 for entity/channel complete",
    inputs: ["All post_extraction_{id}.json for entity/channel"],
    outputs: ["{entity}_{channel}_bedrock.json"],
    dependencies: ["OI-03"]
  },
  "comp-04": {
    id: "COMP-04",
    name: "Social Visual Compiler",
    role: "The Visual Strategist",
    description: "Aggregate social image extractions.",
    phase: "Phase 1: Compilation",
    trigger: "After all OI-02 for entity/channel complete",
    inputs: ["All image_extraction_{id}.json from channel"],
    outputs: ["{entity}_{channel}_visual_bedrock.json"],
    dependencies: ["OI-02"]
  },

  // --- PHASE 2: SYNTHESIS ---
  "oi-11": {
    id: "OI-11",
    name: "The Archaeologist",
    role: "Brand Strategist",
    description: "Synthesize brand platform, archetype, narrative, voice.",
    phase: "Phase 2: Synthesis",
    trigger: "After all COMP agents for entity complete",
    inputs: ["All bedrocks for entity"],
    outputs: [
      "{entity}_brand_platform.json",
      "{entity}_brand_archetype.json",
      "{entity}_brand_narrative.json",
      "{entity}_brand_voice.json"
    ],
    dependencies: ["COMP-01", "COMP-02", "COMP-03", "COMP-04"]
  },
  "oi-12": {
    id: "OI-12",
    name: "Content Strategist",
    role: "Content Planner",
    description: "Synthesize content strategy from channel data.",
    phase: "Phase 2: Synthesis",
    trigger: "After all COMP-03/04 for entity complete",
    inputs: ["All social bedrocks for entity"],
    outputs: ["{entity}_content_strategy.json"],
    dependencies: ["COMP-03", "COMP-04"]
  },
  "oi-13": {
    id: "OI-13",
    name: "The Strategist",
    role: "Competitive Analyst",
    description: "Competitive intelligence and whitespace analysis.",
    phase: "Phase 2: Synthesis",
    trigger: "After OI-11 completes for ALL entities",
    inputs: ["All brand_platform.json files"],
    outputs: [
      "positioning_landscape.json",
      "category_grammar.json",
      "topic_ownership.json",
      "whitespace_analysis.json",
      "competitor_playbooks.json"
    ],
    dependencies: ["OI-11"]
  },
  "oi-14": {
    id: "OI-14",
    name: "The Cartographer",
    role: "Consistency Analyst",
    description: "Internal consistency analysis.",
    phase: "Phase 2: Synthesis",
    trigger: "After all COMP agents for entity complete",
    inputs: ["All bedrocks for single entity"],
    outputs: ["{entity}_internal_consistency.json"],
    dependencies: ["All COMP agents"]
  },
  "oi-15": {
    id: "OI-15",
    name: "Comment Miner",
    role: "Voice of Market Analyst",
    description: "Voice of Market extraction from comments.",
    phase: "Phase 2: Synthesis",
    trigger: "After comment data available",
    inputs: ["Comment corpus for entity"],
    outputs: ["{entity}_voice_of_market.json"],
    dependencies: ["SA-00"]
  },
  "oi-16": {
    id: "OI-16",
    name: "Visual Identity Synthesizer",
    role: "Design Lead",
    description: "Synthesize visual identity from visual bedrocks.",
    phase: "Phase 2: Synthesis",
    trigger: "After COMP-02, COMP-04 complete",
    inputs: ["All visual bedrocks for entity"],
    outputs: ["{entity}_visual_identity.json"],
    dependencies: ["COMP-02", "COMP-04"]
  },
  "oi-17": {
    id: "OI-17",
    name: "Visual Intelligence Analyst",
    role: "Visual Competitor",
    description: "Cross-entity visual competitive analysis.",
    phase: "Phase 2: Synthesis",
    trigger: "After OI-16 completes for ALL entities",
    inputs: ["All visual_identity.json files"],
    outputs: ["visual_competitive_analysis.json"],
    dependencies: ["OI-16"]
  },

  // --- PHASE 2: REPORTING ---
  "rpt-01": {
    id: "RPT-01",
    name: "Emergent Brand Report Generator",
    role: "Report Writer",
    description: "Generate human layer brand report.",
    phase: "Phase 2: Reporting",
    trigger: "After OI-11 completes for entity",
    inputs: ["All OI-11 outputs for entity"],
    outputs: ["{entity}_emergent_brand_report.md"],
    dependencies: ["OI-11"]
  },
  "rpt-02": {
    id: "RPT-02",
    name: "Channel Audit Report Generator",
    role: "Report Writer",
    description: "Generate per-channel social audit.",
    phase: "Phase 2: Reporting",
    trigger: "After COMP-03 completes",
    inputs: ["Channel bedrock"],
    outputs: ["{entity}_{channel}_audit_report.md"],
    dependencies: ["COMP-03"]
  },
  "rpt-03": {
    id: "RPT-03",
    name: "Competitive Landscape Report Generator",
    role: "Report Writer",
    description: "Generate competitive intelligence report.",
    phase: "Phase 2: Reporting",
    trigger: "After OI-13 completes",
    inputs: ["All OI-13 outputs"],
    outputs: ["competitive_landscape_report.md"],
    dependencies: ["OI-13"]
  },
  // We can add more RPT agents as needed but this covers the core flow
  "bridge-01": {
    id: "BRIDGE-01",
    name: "BAM Input Pack Generator",
    role: "Handoff Specialist",
    description: "Package synthesis for Brand Action Model input.",
    phase: "Phase 2: Handoff",
    trigger: "After all Phase 2 synthesis complete",
    inputs: ["All synthesis outputs"],
    outputs: ["bam_input_pack.json"],
    dependencies: ["All OI agents"]
  }
};
