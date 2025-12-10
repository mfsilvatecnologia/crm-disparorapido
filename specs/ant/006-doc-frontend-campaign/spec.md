# Feature Specification: Campaign Lead Stages Management Frontend

**Feature Branch**: `006-doc-frontend-campaign`
**Created**: 2025-10-09
**Status**: Draft
**Input**: User description: "@doc/FRONTEND_CAMPAIGN_STAGES_SPEC.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Custom Lead Stages (Priority: P1)

As a sales manager, I need to create and configure custom lead stages for my campaigns so that I can track my unique sales process and match how my team actually sells.

**Why this priority**: This is the foundation of the entire system. Without the ability to configure stages, none of the other features can work. This is the MVP that delivers immediate value by allowing companies to define their sales funnel.

**Independent Test**: Can be fully tested by creating a new company account, navigating to stage configuration, creating 3-5 stages with different categories, colors, and icons, reordering them via drag-and-drop, and verifying they persist correctly. Delivers standalone value as a sales funnel configuration tool.

**Acceptance Scenarios**:

1. **Given** I am on the stage configuration page, **When** I click "Create Stage" and fill in name "Qualificação", select category "qualificacao", choose color "#10B981", select icon "star", and set charging to R$ 5.00, **Then** the stage is created with ordem auto-assigned and appears in my stage list
2. **Given** I have 5 existing stages, **When** I drag stage at position 2 to position 4, **Then** the reorder API is called and all stages update their ordem values correctly
3. **Given** I have a stage named "Novo Lead", **When** I try to create another stage with the same name, **Then** I receive a 409 error with message "Nome duplicado"
4. **Given** I already have one stage marked as initial, **When** I try to create another stage with isInicial=true, **Then** I receive a 409 error preventing multiple initial stages
5. **Given** I have configured 20 stages, **When** I try to create a 21st stage, **Then** I receive a 400 error indicating the maximum limit has been reached
6. **Given** I want to configure charging, **When** I check "Cobrar créditos" but leave custocentavos empty, **Then** validation prevents submission and shows error message

---

### User Story 2 - Move Leads Between Stages (Priority: P1)

As a sales representative, I need to move leads between stages as they progress through my sales process so that I can track where each lead is in the funnel and take appropriate next actions.

**Why this priority**: This is core functionality that makes the stage system useful. Without the ability to move leads, the stages are just static labels. This delivers immediate operational value to sales teams.

**Independent Test**: Can be fully tested by creating a campaign with 20 leads in "Novo Lead" stage, then manually moving individual leads to "Qualificação", verifying the lead's current_stage_id updates, checking that history is recorded, and confirming charge warnings appear when applicable.

**Acceptance Scenarios**:

1. **Given** I am viewing a lead in "Novo Lead" stage, **When** I drag it to "Qualificação" stage and enter reason "Lead respondeu email", **Then** the lead moves to the new stage, history is recorded with motivo and duracaoHoras, and the UI updates immediately
2. **Given** I have 10 selected leads in various stages, **When** I click "Bulk Update" and select target stage "Perdido" with reason "Não responderam após 7 dias", **Then** all 10 leads transition successfully and I see summary showing successCount: 10
3. **Given** the target stage has cobraCreditos=true and my company balance is insufficient, **When** I move a lead to that stage, **Then** the lead STILL moves successfully but I see a warning "Cobrança de R$ 5,00 falhou: Saldo insuficiente"
4. **Given** I move a lead from "Negociação" back to "Qualificação", **When** the transition completes, **Then** it succeeds (backward transitions are allowed) and history shows the reverse movement
5. **Given** I bulk update 50 leads, **When** 2 leads fail due to not being found, **Then** the response shows successCount: 48, failedCount: 2, with detailed error array listing which leads failed

---

### User Story 3 - View Lead Stage History (Priority: P1)

As a sales manager, I need to see the complete history of stage transitions for each lead so that I can understand the lead's journey, identify bottlenecks, and audit sales team activity.

**Why this priority**: Essential for understanding lead behavior and sales process effectiveness. Without history, transitions are a black box. This is MVP-level because it provides critical visibility into the sales funnel.

**Independent Test**: Can be fully tested by taking a single lead, moving it through 4-5 stages with different reasons and users, then viewing the history timeline and verifying all transitions appear with correct timestamps, durations, user attributions, and motivos.

**Acceptance Scenarios**:

1. **Given** I open a lead detail page, **When** I view the stage history timeline, **Then** I see all transitions ordered by createdAt DESC with fromStageName → toStageName, motivo, userName, duracaoHoras, and automatic flag
2. **Given** a lead was automatically created in "Novo Lead", **When** I view history, **Then** the first entry shows fromStageId: null, automatico: true, and no userName
3. **Given** a lead spent 48.5 hours in "Qualificação", **When** I view the transition OUT of that stage, **Then** the history entry shows duracaoHoras: 48.5
4. **Given** João Silva manually moved a lead with motivo "Proposta enviada", **When** I view history, **Then** I see userName: "João Silva", automatico: false, and motivo displayed
5. **Given** I need to track team performance, **When** I review history for 20 leads, **Then** I can identify which users made transitions and calculate average stage durations

---

### User Story 4 - View Funnel Metrics Dashboard (Priority: P2)

As a sales manager, I need to see metrics about my campaign funnel including lead counts per stage, conversion rates, and average durations so that I can identify bottlenecks and optimize my sales process.

**Why this priority**: Important for strategic decision-making but not required for daily operations. Teams can operate without metrics initially, making this P2 rather than P1. Still valuable for management visibility.

**Independent Test**: Can be fully tested by creating a campaign with 100 leads distributed across 6 stages, requesting funnel metrics, and verifying the response shows correct leadCount per stage, percentageOfTotal, conversionFromPrevious calculations, and averageDurationHours.

**Acceptance Scenarios**:

1. **Given** I have a campaign with 100 total leads distributed across 6 stages, **When** I view the funnel metrics dashboard, **Then** I see each stage with its leadCount, percentageOfTotal, and visual funnel chart
2. **Given** 30 leads are in "Novo Lead" and 20 progressed to "Contato", **When** I view metrics, **Then** "Contato" shows conversionFromPrevious: 66.67%
3. **Given** leads spend an average of 48 hours in "Qualificação", **When** I view metrics, **Then** "Qualificação" shows averageDurationHours: 48.0
4. **Given** my campaign has 1000 leads, **When** I request funnel metrics, **Then** the response arrives in under 3 seconds (performance requirement)
5. **Given** I want to identify bottlenecks, **When** I view the funnel, **Then** I can quickly see which stage has the lowest conversion rate and highest duration

---

### User Story 5 - Configure Stage Charging (Priority: P2)

As a company admin, I need to configure which stages charge credits and set the cost per transition so that I can control billing and monetize different levels of lead engagement.

**Why this priority**: Important for business operations and monetization but not blocking for basic lead management. Teams can use stages without charging initially, making this a P2 enhancement.

**Independent Test**: Can be fully tested by configuring stage charging settings, setting specific stages to charge R$ 5.00, moving leads to those stages, and verifying charges are recorded in campaign_stage_charges table with correct amounts and success/failure status.

**Acceptance Scenarios**:

1. **Given** I am editing a stage, **When** I check "Cobrar créditos" and set custocentavos: 500, **Then** the stage saves with cobraCreditos: true and subsequent transitions to this stage attempt to charge R$ 5.00
2. **Given** I have empresa.debitarMudancaEstagio: false, **When** leads transition to charging stages, **Then** no charges occur (useful for testing)
3. **Given** a stage charges R$ 5.00 and my balance is R$ 10.00, **When** I move a lead to that stage, **Then** my balance becomes R$ 5.00 and foiCobrado: true is recorded
4. **Given** my balance is R$ 0.00 but stage charges R$ 5.00, **When** I move a lead, **Then** the transition SUCCEEDS, balance goes to -R$ 5.00, and I see a warning message
5. **Given** I want to audit charges, **When** I view campaign charges summary, **Then** I see totalCharges, successfulCharges, failedCharges, and chargesByStage breakdown

---

### User Story 6 - Manage Stage Lifecycle (Priority: P2)

As a sales operations manager, I need to edit existing stages, deactivate unused stages, and handle validation errors so that I can maintain and evolve my sales process over time.

**Why this priority**: Necessary for long-term system maintenance but not critical for initial launch. Teams can work with their initial stage configuration for weeks before needing lifecycle management.

**Independent Test**: Can be fully tested by creating stages, editing their names/colors/costs, attempting to edit restricted fields like categoria, trying to delete stages with active leads, and successfully deleting empty stages.

**Acceptance Scenarios**:

1. **Given** I have an existing stage "Qualificação", **When** I edit it to change nome to "Qualificação Premium", cor to "#8B5CF6", and custocentavos to 750, **Then** these fields update successfully
2. **Given** I try to edit a stage's categoria from "novo" to "qualificacao", **When** I submit, **Then** I receive a 400 error because categoria cannot be changed after creation
3. **Given** I have a stage with 15 active leads, **When** I try to delete it, **Then** I receive a 409 error indicating "Estágio tem leads ativos"
4. **Given** I have an empty stage "Teste", **When** I delete it, **Then** it is soft-deleted (isAtivo: false) and disappears from active stage lists
5. **Given** I want to temporarily disable a stage, **When** I set isAtivo: false, **Then** the stage no longer appears in stage selection dropdowns but existing leads remain in that stage

---

### Edge Cases

- **Empty state handling**: What happens when a company has no stages configured? System should auto-create a default "Novo Lead" stage as isInicial=true
- **Concurrent updates**: What happens when two users simultaneously move the same lead to different stages? Last write wins, both transitions are recorded in history
- **Charge failures with bulk updates**: How does the system handle 50 leads transitioning when charges start failing mid-batch? All transitions complete, chargeWarnings array lists failures but successCount is accurate
- **Stage deletion with historical references**: What happens to history records when a stage is soft-deleted? History preserves fromStageId/toStageId even if stage is inactive, stageName is stored denormalized
- **Maximum stage limit**: What happens when trying to reorder stages after reaching the 20-stage limit? Reorder works, but creation of new stages is blocked
- **Invalid color formats**: How does the system validate color input? Frontend validates hex format #RRGGBB before submission, backend validates and returns 400 if invalid
- **Negative credit balances**: What is the behavior when balance reaches very negative values (e.g., -R$ 1000)? System allows unlimited negative balance, transitions continue working, admin sees warning banner
- **Network failures during drag-and-drop**: What happens if the stage transition API call fails? Lead reverts to original position, error toast appears, user can retry
- **Missing icon/color in stages**: What defaults are applied? Default color: #3B82F6 (blue), default icon: "circle"
- **Bulk update partial failures**: When updating 50 leads and 10 fail validation, what is the user experience? Success summary shows breakdown, expandable section lists failed leads with specific error messages

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating up to 20 campaign lead stages per company with unique names
- **FR-002**: System MUST support stage configuration including nome, categoria (enum: novo/contato/qualificacao/negociacao/ganho/perdido), cor (hex), icone, ordem (integer), isInicial (boolean), isFinal (boolean)
- **FR-003**: System MUST enforce exactly ONE stage per company with isInicial=true
- **FR-004**: System MUST allow reordering stages via drag-and-drop which calls POST /api/v1/campaign-lead-stages/reorder with updated ordem values
- **FR-005**: System MUST support stage charging configuration with cobraCreditos (boolean) and custocentavos (integer, required if cobraCreditos=true)
- **FR-006**: System MUST allow moving individual leads between stages via PATCH /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage with stageId, motivo, and automatico flag
- **FR-007**: System MUST support bulk stage updates for multiple leads via POST /api/v1/campaigns/{campaignId}/contacts/bulk-stage-update
- **FR-008**: System MUST record all stage transitions in campaign_contact_stage_history with fromStageId, toStageId, motivo, automatico, duracaoHoras, criadoPor, createdAt
- **FR-009**: System MUST calculate duracaoHoras automatically based on time between transitions
- **FR-010**: System MUST display stage transition history as a timeline ordered by createdAt DESC with fromStageName → toStageName, userName, motivo, duracaoHoras
- **FR-011**: System MUST attempt to charge credits when transitioning to stages with cobraCreditos=true, but MUST NOT block the transition if charging fails
- **FR-012**: System MUST display charge warnings in the UI when credit charges fail but transition succeeds
- **FR-013**: System MUST allow negative credit balances (no constraint enforcement)
- **FR-014**: System MUST prevent stage deletion if campaign_contacts.current_stage_id references that stage (409 Conflict)
- **FR-015**: System MUST soft-delete stages by setting isAtivo=false rather than hard deleting records
- **FR-016**: System MUST fetch funnel metrics via GET /api/v1/campaigns/{campaignId}/funnel showing leadCount, percentageOfTotal, conversionFromPrevious, averageDurationHours per stage
- **FR-017**: System MUST display funnel metrics in under 3 seconds for campaigns with up to 1000 leads
- **FR-018**: System MUST support filtering stages by categoria and includeInactive query parameters
- **FR-019**: System MUST validate that categoria and isInicial cannot be changed after stage creation (400 Bad Request)
- **FR-020**: System MUST support listing campaign charges via GET /api/v1/campaigns/{campaignId}/charges with filters for startDate, endDate, stageId, foiCobrado
- **FR-021**: System MUST display charge audit information including custocentavos, tipoCobranca, foiCobrado, erroCobranca, creditoTransacaoId
- **FR-022**: System MUST fetch charge summary via GET /api/v1/campaigns/{campaignId}/charges/summary showing totalCharges, successfulCharges, failedCharges, totalAmountCentavos, chargesByStage
- **FR-023**: System MUST use Bearer token authentication for all API requests via Authorization header
- **FR-024**: System MUST implement Row Level Security (RLS) multi-tenancy where empresa A cannot access empresa B's data
- **FR-025**: System MUST allow backward stage transitions (e.g., Negociação → Qualificação)

### Key Entities

- **CampaignLeadStage**: Represents a stage in the sales funnel with attributes: id (UUID), empresaId (UUID), nome (string, unique per company), categoria (enum), cor (hex string), icone (string), ordem (integer), isInicial (boolean), isFinal (boolean), cobraCreditos (boolean), custocentavos (integer), descricaoCobranca (string), isAtivo (boolean), criadoPor (UUID), createdAt/updatedAt (ISO 8601)
- **CampaignContact**: Represents a lead in a campaign with current_stage_id (UUID foreign key to CampaignLeadStage), stageChangedAt (timestamp), stageChangedBy (UUID)
- **CampaignContactStageHistory**: Audit trail of all stage transitions with attributes: id (UUID), campaignContactId (UUID), fromStageId (UUID, nullable), toStageId (UUID), motivo (string), automatico (boolean), duracaoHoras (float), criadoPor (UUID), createdAt (ISO 8601). Relationships: belongs to CampaignContact, references CampaignLeadStage for both from and to stages
- **CampaignStageCharge**: Billing record for stage transitions with attributes: id (UUID), empresaId (UUID), campanhaId (UUID), campaignContactId (UUID), stageId (UUID), custocentavos (integer), tipoCobranca (enum: mudanca_estagio/acesso_lead/execucao_agente), creditoTransacaoId (UUID, nullable), motivo (string), foiCobrado (boolean), erroCobranca (string), createdAt (ISO 8601)
- **Empresa**: Company entity with billing configuration: modeloCobrancaCampanha (enum), debitarMudancaEstagio (boolean)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and configure 5 custom stages in under 3 minutes including names, colors, icons, and charging settings
- **SC-002**: Users can move individual leads between stages with the UI updating in under 500ms after API response
- **SC-003**: Bulk updates of 50 leads complete in under 5 seconds with accurate success/failure reporting
- **SC-004**: Funnel metrics for campaigns with 1000 leads load in under 3 seconds
- **SC-005**: Stage transition history displays correctly with all required information (timestamps, durations, users, reasons) for 100% of transitions
- **SC-006**: Credit charging attempts are recorded with 100% accuracy in the audit table regardless of success/failure
- **SC-007**: System prevents 100% of invalid operations (duplicate stage names, multiple initial stages, deleting stages with active leads) with clear error messages
- **SC-008**: Drag-and-drop stage reordering works smoothly with visual feedback and persists correctly in 100% of attempts
- **SC-009**: Charge warnings display prominently in the UI when credit charges fail, allowing users to understand the situation without blocking their workflow
- **SC-010**: System maintains multi-tenancy isolation with 0 cross-company data leaks (validated via RLS and JWT empresa_id checks)
