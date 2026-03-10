---
status: done
priority: normal
tags: [meta, enhancement]
created: 2026-03-10
resolved: 2026-03-10
---

# T033 — Add landing page

## Problem

The skill had no public-facing landing page. Visitors from GitHub, skills.sh, or social shares had no quick overview of what the skill does, how to install it, or what's included.

## Resolution

- Added `landing-page/index.html` — single-file static page with split layout (typewriter branding + terminal install commands), light/dark theme, and expanded FAQ (8 items)
- FAQ covers: difference vs. raw AI, Claude Desktop install, supported agents, what's included, best model, updating, trust/disclaimer, and pricing
- Added `<meta name="description">`, Open Graph, and Twitter Card meta tags for social sharing
- Removed `landing-page/` from `.gitignore`
- Updated CLAUDE.md version convention to include the landing page version badge
- Designed for Vercel deployment with Git sync
