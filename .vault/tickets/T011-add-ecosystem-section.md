---
status: done
priority: high
tags: [skill, enhancement]
created: 2026-02-13
resolved: 2026-02-13
---

# T011 — Add Ecosystem section to SKILL.md

## Problem

The skill documents contract interfaces and runtime scripts but has no coverage of the broader ecosystem — SDKs (active and deprecated), API services, subgraphs, public apps, governance/SUP token, or operational processes (token listing, automation allowlisting). The AI can't answer "which SDK should I use?", "how do I get token prices?", or "what's the SUP token address?".

## Solution

Add an Ecosystem section to SKILL.md with subsections for SDKs & Packages, API Services, Subgraphs, Apps, Foundation/DAO/SUP Token, and Processes. Add use-case routing entries in the existing map. Keep everything inline for now — each subsection can be split into `references/ecosystem/*.md` when detail grows.

## Acceptance Criteria

- [x] Use-case routing entries for ecosystem topics in the reference map
- [x] SDKs section with active/deprecated split and opinionated guidance
- [x] API Services table with gotchas (Accounting no GDA, CMS unlisted tokens)
- [x] Subgraphs section with RPC-over-subgraph caveat (staleness, GDA scalability)
- [x] Apps table with repo links
- [x] Foundation/DAO/SUP section with durable facts (no stale price data)
- [x] Processes section (token listing, automation allowlisting)
- [x] All repo links included
- [x] Cross-references to existing script sections (no duplication)
- [x] Home.md updated

## Resolution

Added "Ecosystem" top-level section to SKILL.md with six subsections: SDKs & Packages (4 active with opinionated when-to-use guidance, 4 deprecated with replacement pointers), API Services (6 APIs with gotchas and OpenAPI/Swagger links), Subgraphs (4 endpoints with RPC-preferred caveat explaining continuous state and GDA/IDA scalability design), Apps (4 public apps with repos), Foundation/DAO/SUP Token (governance structure, token distribution mechanics, Locker/Reserve terminology), and Processes (token listing and automation allowlisting workflows). Added use-case routing entries in the reference map. All items include repo links.
