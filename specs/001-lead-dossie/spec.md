# Feature Specification: Lead Dossier with PH3A Enrichment

**Feature Branch**: `001-lead-dossie`
**Created**: 2025-12-05
**Status**: Draft
**Input**: User description: "criar tela lead-dossie, para mostrar os leads do sistema e com a possibilidade de fazer uma busca de dados da api ph3a que foi implementado no backend para enriquecimento de informações, esse é um recurso pago se a pessoa tiver crédito e com níveis de valores diferenciados conforma a informação, um valor específico para saúde financeira, rastro digital, validação cadastral, etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Lead List (Priority: P1)

As a sales representative, I want to see a list of all leads in the system so that I can identify which leads to work with and prioritize my outreach efforts.

**Why this priority**: This is the foundation of the feature - users must be able to see leads before they can enrich them. Without this, no other functionality is accessible.

**Independent Test**: Can be fully tested by logging in as a user with leads, navigating to the lead dossier page, and verifying that a list of leads is displayed with basic information (name, document number, creation date, status).

**Acceptance Scenarios**:

1. **Given** I am logged in with leads in the system, **When** I navigate to the lead dossier page, **Then** I see a paginated list of leads with basic information
2. **Given** I am viewing the lead list, **When** I filter or search for specific leads, **Then** the list updates to show only matching results
3. **Given** the system has no leads, **When** I navigate to the lead dossier page, **Then** I see an empty state message inviting me to create or import leads
4. **Given** I am viewing the lead list, **When** I click on a lead, **Then** I see detailed information about that lead

---

### User Story 2 - Check Enrichment Credit Balance (Priority: P2)

As a sales manager, I want to view my current credit balance for lead enrichment so that I can manage my budget and decide which leads to enrich.

**Why this priority**: Users need visibility into their available credits before attempting to purchase enrichment data. This prevents frustration from attempting purchases without sufficient balance.

**Independent Test**: Can be tested by displaying the credit balance on the lead dossier page and verifying it updates correctly after enrichment purchases.

**Acceptance Scenarios**:

1. **Given** I am on the lead dossier page, **When** the page loads, **Then** I see my current credit balance displayed prominently
2. **Given** I have credits available, **When** I view enrichment options, **Then** I see the cost of each enrichment package clearly displayed
3. **Given** I have insufficient credits, **When** I attempt to purchase enrichment, **Then** I see a message explaining I need more credits and options to purchase more
4. **Given** I purchase credits, **When** the transaction completes, **Then** my displayed balance updates immediately

---

### User Story 3 - Purchase Individual Enrichment Data (Priority: P1)

As a sales representative, I want to purchase specific enrichment data packages (financial health, digital trace, registry validation) for a lead so that I can qualify the lead without overspending on unnecessary data.

**Why this priority**: This is the core value proposition - allowing users to enrich leads with PH3A data. Users need the flexibility to purchase only the data they need to control costs.

**Independent Test**: Can be tested by selecting a lead, choosing a specific enrichment package (e.g., financial health), confirming the purchase, and verifying the data appears in the lead profile and credits are deducted.

**Acceptance Scenarios**:

1. **Given** I am viewing a lead without enrichment data, **When** I click "Enrich Lead", **Then** I see available enrichment packages with individual pricing
2. **Given** I select "Financial Health" enrichment, **When** I confirm the purchase, **Then** I see a confirmation modal showing the cost and what data will be retrieved
3. **Given** I confirm the enrichment purchase, **When** the API request succeeds, **Then** the financial health data appears in the lead profile and my credit balance decreases by the package cost
4. **Given** the enrichment API request fails, **When** an error occurs, **Then** I see an error message, my credits are not deducted, and I have the option to retry
5. **Given** I already purchased an enrichment package for a lead, **When** I view enrichment options, **Then** previously purchased packages are marked as "Already purchased" with the purchase date

---

### User Story 4 - View Enriched Lead Profile (Priority: P1)

As a sales representative, I want to view enriched data for a lead in organized cards/sections so that I can quickly assess the lead's quality, financial health, and likelihood to convert.

**Why this priority**: This is essential for users to consume and act on the enriched data. Without a clear presentation, the enrichment data has no value.

**Independent Test**: Can be tested by enriching a lead with multiple packages and verifying each data type appears in its dedicated card with proper formatting and source attribution.

**Acceptance Scenarios**:

1. **Given** I purchased "Financial Health" enrichment, **When** I view the lead profile, **Then** I see a "Financial Health" card with credit score, risk level, purchase capacity, and data source clearly labeled
2. **Given** I purchased "Digital Trace" enrichment, **When** I view the lead profile, **Then** I see a "Digital Trace" card with visit metrics, lead temperature, and detected intent tags
3. **Given** I purchased "Registry Validation" enrichment, **When** I view the lead profile, **Then** I see a "Validation" card with CPF status, name verification, address verification, and death record check
4. **Given** enrichment data is loading, **When** the API request is in progress, **Then** I see loading indicators in the relevant cards
5. **Given** I have not purchased any enrichment, **When** I view the lead profile, **Then** I see placeholder cards inviting me to purchase enrichment packages

---

### User Story 5 - Purchase Complete Enrichment Package (Priority: P3)

As a sales manager, I want to purchase a complete enrichment package (all data types) for a lead at a discounted rate so that I can get comprehensive insights while saving on costs compared to individual purchases.

**Why this priority**: This is a convenience feature that provides value through bundling, but is not essential for the MVP. Users can still achieve the same result by purchasing individual packages.

**Independent Test**: Can be tested by selecting the "Complete Package" option, confirming purchase, and verifying all enrichment data types appear and the bundled discount is applied.

**Acceptance Scenarios**:

1. **Given** I am viewing enrichment options for a lead, **When** I see the package list, **Then** I see a "Complete Package" option that includes all data types at a discounted total price
2. **Given** I select the "Complete Package", **When** I confirm purchase, **Then** all enrichment data types are retrieved and my credits are deducted by the bundled price (less than the sum of individual packages)
3. **Given** I already purchased some individual packages, **When** I view the "Complete Package" option, **Then** the price reflects a credit for already-purchased packages

---

### Edge Cases

- What happens when a lead's document number (CPF/CNPJ) is invalid or not found in the PH3A database?
- How does the system handle partial data returns from PH3A (some fields missing or null)?
- What happens when enrichment data expires (90 days as per the schema)?
- How does the system handle concurrent enrichment purchases for the same lead by different users?
- What happens when a user's credit balance becomes insufficient during an ongoing enrichment request?
- How does the system handle PH3A API rate limits or temporary unavailability?
- What happens when enrichment data contains negative flags (e.g., death record found, CPF irregular)?
- How does the system present LGPD-sensitive data (masked vs full display based on permissions)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of all leads accessible to the current user with basic information (name, document number, status, creation date)
- **FR-002**: System MUST provide search and filter capabilities for the lead list (by name, document number, status, tags)
- **FR-003**: System MUST display the current user's credit balance for PH3A enrichment services prominently on the lead dossier page
- **FR-004**: System MUST show enrichment package options with individual pricing when a user selects a lead to enrich
- **FR-005**: System MUST support the following enrichment packages with differentiated pricing:
  - Financial Health (Saúde Financeira)
  - Enriched Profile (Perfil Enriquecido)
  - Digital Trace (Rastro Digital)
  - Market Affinity (Afinidade de Mercado)
  - Registry Validation (Validação Cadastral)
  - Complete Package (all of the above at a bundled rate)
- **FR-006**: System MUST display a confirmation modal before completing an enrichment purchase showing the package name, cost, and what data will be retrieved
- **FR-007**: System MUST deduct credits from the user's balance only after successful enrichment data retrieval from PH3A API
- **FR-008**: System MUST refund credits if the enrichment request fails or returns no data
- **FR-009**: System MUST display enriched data in dedicated cards/sections organized by data type (Financial Health, Profile, Digital Trace, Affinity, Validation)
- **FR-010**: System MUST show the data source (e.g., "Fonte: DataFraud", "Fonte: DataBusca") in each enrichment card header
- **FR-011**: System MUST display the date and time when enrichment data was last updated for each package
- **FR-012**: System MUST prevent duplicate purchases of the same enrichment package for the same lead within the data validity period (90 days)
- **FR-013**: System MUST show a "Refresh" or "Update" option for expired enrichment data (older than 90 days)
- **FR-014**: System MUST handle and display partial data from PH3A gracefully, showing "Not available" or similar for missing fields
- **FR-015**: System MUST mask sensitive personal data (phone numbers, emails, addresses) according to LGPD compliance rules and user permissions
- **FR-016**: System MUST display loading states for each enrichment card while data is being fetched
- **FR-017**: System MUST display error states with retry options when enrichment requests fail
- **FR-018**: System MUST show visual indicators (badges, color coding) for critical data points (e.g., "Low Risk" in green, "High Risk" in red, CPF "Regular" vs "Irregular")
- **FR-019**: System MUST provide an option to purchase additional credits when balance is insufficient
- **FR-020**: System MUST log all enrichment purchases for audit purposes (user, lead, package, cost, timestamp)
- **FR-021**: Users MUST be able to view enrichment history for each lead (what was purchased, when, by whom)
- **FR-022**: System MUST support mobile-responsive layout for viewing lead lists and enrichment data on smaller screens
- **FR-023**: System MUST integrate with the existing PH3A API backend implementation for data retrieval
- **FR-024**: System MUST validate user has sufficient credits before allowing enrichment purchase confirmation

### Key Entities

- **Lead**: Represents a potential customer in the system, with basic information (name, document number, email, phone) and status tracking
- **Enrichment Package**: Represents a purchasable data bundle from PH3A (type, cost in credits, data fields included, source provider)
- **Credit Balance**: Represents the user/account's available credits for purchasing enrichment data
- **Enrichment Transaction**: Represents a completed or failed enrichment purchase (lead, package, cost, timestamp, status, user)
- **Dossier Data**: Represents the enriched data retrieved from PH3A for a specific lead, organized by data type (financial health, profile, digital trace, affinity, validation) with expiration tracking (90-day validity)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view a list of leads and navigate to a specific lead profile in under 5 seconds
- **SC-002**: Users can complete an enrichment purchase (select package, confirm, view results) in under 30 seconds for a single package
- **SC-003**: 95% of enrichment requests complete successfully within 10 seconds
- **SC-004**: Enriched data is displayed in organized, scannable cards that allow users to assess lead quality in under 60 seconds
- **SC-005**: Users can clearly identify their credit balance and the cost of each enrichment package before making a purchase decision
- **SC-006**: Zero unauthorized credit deductions (credits only deducted when enrichment data is successfully retrieved)
- **SC-007**: System prevents 100% of duplicate enrichment purchases within the 90-day validity period
- **SC-008**: Users can identify critical risk factors (CPF irregular, death record, high risk score) within 10 seconds of viewing the lead profile
- **SC-009**: Sales representatives report a 40% reduction in time spent researching lead background information
- **SC-010**: System maintains 99.5% uptime for lead list viewing and enrichment purchase flows
