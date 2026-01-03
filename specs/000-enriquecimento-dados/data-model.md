# Data Model (Phase 1)

Derived from `spec.md` (P1–P4) for frontend types and contract alignment.

## Entities

### Lead
- Fields: id (string), name, company, contact info, enrichmentStatus (idle|queued|processing|completed|error), latestEnrichmentJobId (string|nullable), dossierId (string|nullable).
- Relationships: 1:N with EnrichmentJob; 1:1 optional with Dossiê.

### EnrichmentJob
- Fields: id (string), leadId (string), providersSelected (string[]), status (queued|processing|completed|error), totalEstimatedCost (number), totalConsumedCredits (number), startedAt, completedAt, traceId (string), executionIds (string[]).
- Relationships: 1:N with EnrichmentResult.
- Validation: providersSelected required, status transitions enforce terminal states (completed/error).

### EnrichmentResult
- Fields: provider (string), status (success|error), output (object, provider-specific), creditsConsumed (number), confidenceScore (0-1 or 0-100 per contract), receivedAt (timestamp), errorMessage (string|nullable).
- Relationships: belongs to EnrichmentJob.
- Validation: creditsConsumed >= 0; confidenceScore within range.

### Dossiê
- Fields: id (string), leadId (string), summary (string|nullable), lastInvestigationId (string|nullable).
- Relationships: 1:1 with Lead; 1:N with Investigation.

### Investigation
- Fields: id (string), dossierId (string), status (pending|running|completed|failed), estimatedDurationSec (number), startedAt, completedAt, riskScore (0-100|nullable), counts {positive, neutral, suspect, negative}, sources (InvestigationSource[]), cost (number).
- Relationships: belongs to Dossiê; 1:N with InvestigationSource.
- Validation: counts non-negative; riskScore within 0-100 when present.

### InvestigationSource
- Fields: url, title, assessment (positive|neutral|suspect|negative), confidence (low|medium|high), impact (low|medium|high), categories (string[]), justification (string), publishedAt (timestamp|nullable).
- Relationships: belongs to Investigation.
- Validation: assessment/confidence/impact must be allowed enums; justification required when assessment != neutral.

### Provider
- Fields: id (string), name, type (web_search|location|company_data), enabled (boolean), priority (number>0), rateLimitPerMin (number>0), costPerRequest (number), healthStatus (active|degraded|inactive).
- Relationships: used by EnrichmentJob; appears in StatsOverview.
- Validation: priority/rateLimit positive; costPerRequest >= 0.

### StatsOverview
- Fields: period {start, end}, providerStats[] with providerId, executions (number), successRatePct (0-100), totalCost (currency), avgDurationSec (number), activeProviders (number), totalExecutions (number), overallSuccessRatePct (number), overallCost (currency).
- Relationships: aggregates Provider.
- Validation: successRatePct within 0-100; durations >= 0; currency formatted in UI as BRL.

## State Transitions (key flows)
- EnrichmentJob: queued → processing → completed|error (stop polling). Partial success represented by EnrichmentResult statuses while job is completed.
- Investigation: pending → running → completed|failed (stop polling). Empty sources allowed with “Nenhuma fonte encontrada”.

## Validation Rules (UI)
- Disable “Enriquecer” when no providers enabled; block confirmation when estimated cost > saldo/credit.
- Forms (provider edit): priority > 0, rate limit > 0; show inline errors.
- Polling retry: max 3 retries with backoff before surfacing error and retry CTA.
