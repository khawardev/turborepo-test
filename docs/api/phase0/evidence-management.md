# Evidence Management API (Phase 0)

> **Base URL:** `https://api-beta.brandos.humanbrand.ai`

---

## Overview

The Evidence Management API (Phase 0) is the foundational analysis pipeline for BrandOS. It processes raw scraped data from batch jobs, assigns unique evidence IDs, and creates a comprehensive evidence ledger that serves as the single source of truth for all downstream analysis.

**Authorization Required:** All endpoints require a valid Bearer token.

---

## Endpoints

### POST `/run-evidence-ledger-builder`
**Run Evidence Ledger Builder** 🔒

Run SA-00: Evidence Ledger Builder. This process catalogs all evidence from completed scraper tasks, creates a structured ledger, and runs the initial Corpus Adequacy Gate (Gate 0).

**Authorization Required:** Yes

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | Yes | Client identifier |
| `brand_id` | string | Yes | Brand ID being analyzed |
| `batch_website_task_id` | string | No | Website batch ID |
| `batch_social_task_id` | string | No | Social batch ID |

> **Note:** At least one of `batch_website_task_id` or `batch_social_task_id` must be provided.

**Response:** `200 OK`
```json
{
  "engagement_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "task_id": "string",
  "evidence_ledger": {
    "evidence_count": 587,
    "evidence_by_type": {
      "webpage": 6,
      "social_post": 140,
      "comment": 234,
      "image": 207
    },
    "evidence": [...]
  },
  "corpus_manifest": {
    "coverage_summary": { ... },
    "corpus_adequacy": { "overall": "pass", ... }
  },
  "gate_0_result": {
    "status": "pass",
    "recommendation": "Proceed with analysis"
  }
}
```

---

### GET `/get-evidence-ledger`
**Get Evidence Ledger** 🔒

Retrieve the complete evidence ledger for a specific engagement/analysis session.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | Yes | Client identifier |
| `engagement_id` | string | Yes | Engagement ID (UUID) |

**Response:** `200 OK`
```json
{
  "engagement_id": "string",
  "evidence_count": 587,
  "evidence_ledger": { ... }
}
```

---

### GET `/get-evidence`
**Get Evidence** 🔒

Retrieve a specific evidence entry with full metadata and source trace.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | Yes | Client identifier |
| `engagement_id` | string | Yes | Engagement ID |
| `evidence_id` | string | Yes | ID (E#####, VE#####, EC#####) |

**Response:** `200 OK`
```json
{
  "evidence_id": "E00001",
  "trace": { ... },
  "full_entry": {
    "evidence_id": "E00001",
    "source_type": "webpage",
    "source_channel": "website",
    "source_entity": "brand-abc",
    "source_url": "https://example.com",
    "content_type": "text",
    "metadata": { ... }
  }
}
```

---

### GET `/validate-evidence-ids`
**Validate Evidence IDs** 🔒

Validate that a list of evidence IDs exist in the evidence ledger.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | Yes | Client identifier |
| `engagement_id` | string | Yes | Engagement ID |
| `evidence_ids` | string | Yes | Comma-separated list |

**Response:** `200 OK`
```json
{
  "total_requested": 4,
  "valid_count": 3,
  "invalid_count": 1,
  "valid_ids": ["E00001", "E00002", "VE00001"],
  "invalid_ids": ["EC99999"]
}
```

---

### POST `/calculate-evidence-strength`
**Calculate Evidence Strength** 🔒

Calculate evidence strength score and quality assessment for a set of evidence IDs.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | Yes | Client identifier |
| `engagement_id` | string | Yes | Engagement ID |
| `evidence_ids` | string | Yes | Comma-separated list |

**Response:** `200 OK`
```json
{
  "evidence_ids": ["E00001", "E00002"],
  "strength_score": 0.73,
  "quality_tier": "good",
  "assessment": "good"
}
```

## Evidence Concepts

### ID Formats
- `E#####`: Text content (webpages, social posts)
- `VE#####`: Visual content (images)
- `EC#####`: Comment content

### Strength Scoring
Evidence strength is calculated based on source credibility:

| Source Type | Weight |
|-------------|--------|
| About/Company pages | 1.0 (Highest) |
| Product/Solution pages | 0.9 |
| News/Press releases | 0.8 |
| Blog content | 0.7 |
| Images/Video | 0.7 |
| Social media posts | 0.6 |
| Comments | 0.4 (Lowest) |

---

[← Back to Documentation Index](./index.md)
