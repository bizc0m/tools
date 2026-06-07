---
id: KM-20260519-0731-km-trigger-structured-markdown
type: idea
title: KM trigger for structured Markdown knowledge
date: 2026-05-19
updated: 2026-05-19
status: active
priority: P1
confidence: high
tags: [km, markdown, agents, workflow]
related: []
source: user
---

# KM trigger for structured Markdown knowledge

## Summary
The `#km` trigger turns raw ideas into classified Markdown knowledge entries that Codex and other agents can reuse later.

## Raw Input
Le trigger #km sert à transformer une idée brute en fiche Markdown classée dans le repo, utilisable ensuite par Codex et les autres agents.

## Key Points
- `#km` is a knowledge ingestion trigger.
- Raw input becomes a structured Markdown entry.
- Entries are classified, linked, indexed, and useful for future agents.

## Relations
- Projet lié : tools knowledge base
- Personnes :
- Sources :
- Décisions : Add KM protocol to repo instructions

## Next Actions
- [ ] Use `#km` for future notes that should become reusable knowledge.

## Agent Notes
When a user starts a message with `#km`, do not build a feature by default. Create or update the relevant `/km/` Markdown entry and refresh `/km/index.md`.

