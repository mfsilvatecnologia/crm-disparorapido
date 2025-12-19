# Research (Phase 0)

All NEEDS CLARIFICATION items resolved; decisions below align to spec and constitution v2.2.0.

## Decisions

1) Polling & Backoff
- Decision: Enrichment polling every 3s; investigation polling every 5s; backoff on failures with 1s → 2s → 4s delays, max 3 retries before surfacing error and a retry CTA.
- Rationale: Matches FR-003/FR-013 and edge-case guidance; keeps network load bounded.
- Alternatives considered: Linear retry (discarded: slower recovery) and infinite retry (discarded: UX stall).

2) Job Status & Notifications
- Decision: Job status enums mirror backend (`queued|processing|completed|error` for enrichment; `pending|running|completed|failed` for investigation). Toast notifications: success, error (all providers failed), partial (some providers failed), plus background completion when user navigates away.
- Rationale: Direct mapping to FR-005/FR-008/FR-009/FR-010 and FR-014–FR-019, SC-004.
- Alternatives considered: Single generic notification (discarded: loses partial/success granularity).

3) Provider Availability & Cost Guardrails
- Decision: Disable “Enriquecer” when zero providers active; surface tooltip. Block confirmation when estimated cost > saldo/credit; show clear message. Fetch provider list and balance before enabling actions.
- Rationale: Edge cases + FR-002/FR-044/FR-045; avoids failed flows due to missing providers or saldo.
- Alternatives considered: Allow request then fail server-side (discarded: poor UX and wasted calls).

4) Provider Health & Priorities (Admin)
- Decision: Table shows name/type/status/priority/rate limit/cost/health. Toggles persist immediately; edits via modal with client-side validation (priority > 0, rate limit > 0). Health badges: green active, yellow degraded, red inactive.
- Rationale: FR-021..FR-028; ensures admin feedback loop is fast (SC-006 target 600ms reflect).
- Alternatives considered: Deferred saves (discarded: reduces confidence and violates SC-006).

5) Stats Dashboard
- Decision: Date range picker default last 7d; optional provider filter. Metrics cards + bar charts (cost per provider, success rate per provider) + table. Auto-refresh on filter changes.
- Rationale: FR-029..FR-038; aligns with SC-005 load targets.
- Alternatives considered: Server-side pagination for cards (discarded: small dataset; charts need all data).

## Open Questions
None at this stage; backend contracts expected in `swagger.json` or delta PR. If missing, block implementation until defined.
