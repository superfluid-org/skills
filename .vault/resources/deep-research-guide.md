# Deep-Research — Authoring Guide

## What Are Deep-Researches?

Background research documents that live inside the Superfluid Protocol skill. Claude consults them when answering questions about Superfluid's history, ecosystem projects, or notable integrations. They are referenced from `SKILL.md` under the "Ecosystem deep-dives" subsection.

**Location:** `skills/superfluid/references/deep-researches/`

## Frontmatter

Every deep-research file must start with this YAML frontmatter:

```yaml
---
title: "<Descriptive title>"
date: YYYY-MM-DD
tags: [tag1, tag2, ...]
sources:
  - https://primary-source.example.com/
  - https://another-source.example.com/
---
```

- `title` — short, descriptive name for the research topic
- `date` — when the research was conducted (bump on refresh)
- `tags` — lowercase keywords for discoverability; always include `superfluid` if relevant
- `sources` — YAML list of primary source URLs used

Do **not** include: `model`, `researcher`, `purpose`, `scope`, `context`, or other internal metadata.

## Content Guidelines

**Format:**
- Markdown with structured sections (`##` headings) and tables where data is dense
- Start with a 1-2 sentence summary immediately after the H1 title
- Use tables for structured data (deployments, versions, stats, funding)
- Use bullet lists for descriptions and relationships
- Include source links inline where claims are specific or surprising

**Focus on:**
- Factual, verifiable information
- Superfluid-relevant details: how the topic uses/integrates with Superfluid (agreements, token types, streaming use cases)
- Contract addresses, token standards, chain deployments, technical architecture
- Useful links (GitHub repos, docs, official sites) for follow-up analysis
- Key partnerships, funding, and governance relevant to the Superfluid ecosystem

**Do NOT include:**
- Basic Superfluid protocol knowledge (CFA, GDA, Super Tokens, etc.) — the skill already has comprehensive protocol docs
- Social media follower counts, app store ratings, marketing claims
- Conference appearance lists
- Detailed hackathon prize breakdowns (brief mention is fine)
- Editorial or opinion sections
- Community channel membership numbers (Discord size, Facebook likes)
- Developer infra details unlikely to help answer user questions (CI setup, etc.)

## Filename

Use a short, topic-based slug: `gooddollar.md`, `flowstate.md`, `superfluid-history.md`. Do not include dates in the filename — the frontmatter `date` field handles that.

## After Creating a New Deep-Research

1. Add a pointer line in `skills/superfluid/SKILL.md` under `### Ecosystem deep-dives`
2. Follow the existing pattern: `- <brief description> → \`references/deep-researches/<filename>.md\``

---

## Prompt Template

Copy the prompt below and replace `[TOPIC]` with the subject you want researched. Run it using deep research or an extended thinking model.

```
Deep research on [TOPIC] for context in the Superfluid Protocol AI skill.

## Output format

- Markdown document
- Start with YAML frontmatter:
  ```yaml
  ---
  title: "[TOPIC]"
  date: [TODAY'S DATE]
  tags: [relevant, lowercase, tags]
  sources:
    - https://...
  ---
  ```
- Structured sections with ## headings
- Use tables for dense data (deployments, versions, stats, funding)
- Include source links inline for specific claims

## Research focus

- What is [TOPIC]? Identity, founding, key people, legal entities
- Technical architecture and key contracts/deployments
- **How does [TOPIC] integrate with Superfluid Protocol?** (agreements used, Super Token types, streaming use cases) — this is the most important section
- Token economics and governance (if applicable)
- Key stats, partnerships, and ecosystem relationships
- Version history and notable incidents (exploits, migrations)
- GitHub repos, NPM packages, docs links (for follow-up analysis)

## What NOT to include

- Basic Superfluid Protocol knowledge (CFA, GDA, Super Tokens, Host, Forwarders) — the skill already covers this comprehensively
- Social media follower counts, app store ratings, marketing claims
- Conference appearance lists or hackathon prize breakdowns
- Editorial opinions or speculative analysis
- Community channel membership numbers

Keep the document factual, concise, and focused on information that helps an AI answer technical questions about [TOPIC] in the context of the Superfluid ecosystem.
```
