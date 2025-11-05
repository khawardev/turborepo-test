export const SCRAPS = 'Data Capture'
export const SCRAPE = 'Capture'
export const SCRAPED = 'Captured'
export const SCRAPING = 'Capturing'

export const MODELS = [
    { id: "claude-3-haiku", name: "Anthropic Claude 3 Haiku — 200K tokens" },
    { id: "claude-4-sonnet", name: "Anthropic Claude 4 Sonnet — 200K tokens" },
    { id: "claude-4-1-opus", name: "Anthropic Claude 4.1 Opus — 200K tokens" },
    { id: "claude-4-opus", name: "Anthropic Claude 4 Opus — 200K tokens" },
    { id: "deepseek-r1", name: "DeepSeek R1 — 128K tokens" },
    { id: "meta-llama4-scout", name: "Meta LLaMA 4 Scout — 3.5M tokens" },
    { id: "claude-3-5-sonnet", name: "Anthropic Claude 3.5 Sonnet — 200K tokens" },
    { id: "claude-3-sonnet", name: "Anthropic Claude 3 Sonnet — 200K tokens" },
    { id: "claude-3-7-sonnet", name: "Anthropic Claude 3.7 Sonnet — 200K tokens" },
]

export const BrandStages = [
    {
        id: "ccba",
        stage: "Stage 1",
        abbreviation: "CCBA",
        name: "Coherence & Competitor Baseline Audit",
        audit: "CCBA Audits",
        previousAbbreviation: null,
        previousName: "No name change"
    },
    {
        id: "bvo",
        stage: "Stage 2",
        abbreviation: "BVO",
        name: "Brand Validation & Optimization",
        audit: "BVO Audits",
        previousAbbreviation: "BAM",
        previousName: "Brand Action Model"
    },
    {
        id: "cge",
        stage: "Stage 3",
        abbreviation: "CGE",
        name: "Content Generation Engine",
        audit: "CGE Audits",
        previousAbbreviation: "CAM",
        previousName: "Content Action Model"
    },
    {
        id: "cbc",
        stage: "Stage 4",
        abbreviation: "CBC",
        name: "Continual Brand Coherence",
        audit: "CBC Audits",
        previousAbbreviation: null,
        previousName: "This stage formalizes the concept referred to as the Learning Loop"
    }
]