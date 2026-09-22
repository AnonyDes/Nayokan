# ADR-003: `site` and `world` are separate concepts

Status: Accepted (2026-09-22)

## Context
The design data model classifies content by `world` (VTI, Startup Centre, VC, Hospitality). The product has three websites, and two worlds (VC, Hospitality) live inside the corporate site. A single field cannot express both "which website serves this" and "which division is this about".

## Decision
- `site` (corporate | vti | startup): which public website owns and serves a record. Drives routing, navigation, canonical URLs, sitemaps, cache tags, analytics and admin filtering.
- `world` (corporate | vti | startup | venture_capital | hospitality): institutional classification.
- Valid pairs, enforced by a database CHECK and `src/platform/sites/types.ts`: corporate→{corporate, venture_capital, hospitality}; vti→{vti}; startup→{startup}.
- Records that appear on several sites are stored once with per-site placements (partners, ventures, people). No duplication.
- Applications and enquiries record the `site` derived from the route tree (never client input), plus source URL and host.
- i18n: English at unprefixed routes; rows carry `locale` and `translation_of`. French arrives later under `/fr` per host. No machine or fake translations are published.
