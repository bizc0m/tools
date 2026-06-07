# Repository Instructions

## Knowledge Management Protocol

When user input starts with `#km`, treat it as a knowledge ingestion request.
Do not implement code unless explicitly requested.
Use all content after `#km` as the raw input.
Create or update structured Markdown files in `/km/`.
Keep entries short, linked, deduplicated, dated, and agent-readable.

Rules:
- Identify the best type: `idea`, `project`, `person`, `source`, `decision`, `prompt`, `event`, or `risk`.
- Store entries in the matching folder under `/km/`.
- Before creating a file, search `/km/` by title, slug, tags, and keywords.
- If a close entry exists, update it and add a `## Updates` section. Do not overwrite history.
- Update `/km/index.md` after every ingestion.
- Do not invent sources. Mark uncertainty with `confidence: low` or in `Agent Notes`.
- Use simple Markdown.
- Keep the original text in `Raw Input` when useful.

Naming:
- File: `YYYY-MM-DD_type_slug.md`
- ID: `KM-YYYYMMDD-HHMM-slug`

Frontmatter:
```yaml
---
id: KM-YYYYMMDD-HHMM-slug
type: idea|project|person|source|decision|prompt|event|risk
title:
date:
updated:
status: draft|active|archived
priority: P0|P1|P2|P3
confidence: low|medium|high
tags: []
related: []
source:
---
```

