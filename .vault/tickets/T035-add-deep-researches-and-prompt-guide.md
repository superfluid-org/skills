---
status: done
priority: normal
tags: [skill, enhancement, meta]
created: 2026-03-10
resolved: 2026-03-10
---

# T035 — Add deep-researches and prompt guide

## Problem

The skill lacked background research on Superfluid's history and notable ecosystem projects (GoodDollar, Flow State). There was also no standardized process for producing additional deep-research files.

## Resolution

- Added 3 deep-research files to `skills/superfluid/references/deep-researches/`:
  - `superfluid-history.md` — protocol origin, founding, funding, Feb 2022 exploit, SUP token, key integrations, timeline
  - `gooddollar.md` — G$ as Pure Super Token on Celo, UBI distribution, reserve mechanics, GoodCollective streaming
  - `flowstate.md` — Streaming Quadratic Funding, Flow Councils, Flow Splitters, cooperative model
- Slimmed all 3 files for token efficiency (~828 → ~629 lines): removed community stats, hackathon tables, follower counts, editorial sections; preserved all Superfluid-relevant technical content and useful links
- Normalized frontmatter across all files to uniform `title`/`date`/`tags`/`sources` format
- Added "Ecosystem deep-dives" subsection to SKILL.md pointing to the 3 files
- Created `.vault/resources/deep-research-guide.md` — authoring guide with frontmatter spec, content guidelines, exclusion list, and copy-paste prompt template
