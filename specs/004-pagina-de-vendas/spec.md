# Feature Specification: Página de Vendas com Sistema de Assinaturas

**Feature Branch**: `004-pagina-de-vendas`
**Created**: 2025-10-04
**Status**: Draft
**Input**: User description: "pagina de vendas baseado no doc @doc/FRONTEND_SALES_PAGE_SPEC.md  @doc/EMAIL_FRONTEND_TEAM.md  @doc/FRONTEND_SALES_QUICK_START.md"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Sales page with subscription system including free trial
2. Extract key concepts from description
   → Actors: Potential customers, existing customers
   → Actions: View plans, start trial, manage subscription, cancel
   → Data: Products/plans, subscriptions, trial periods, payment info
   → Constraints: Trial periods, billing cycles, authentication required
3. For each unclear aspect:
   → All aspects well-defined in reference documentation
4. Fill User Scenarios & Testing section
   → Clear user flows from landing to trial activation
5. Generate Functional Requirements
   → All requirements testable and defined
6. Identify Key Entities
   → Products, Subscriptions, Trial periods
7. Run Review Checklist
   → No implementation details included
   → Focus on user needs and business requirements
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story
A potential customer visits the sales page to explore available subscription plans. They can compare features across different tiers, see pricing information, and understand the trial offer. When ready, they select a plan and initiate a free trial period without immediate payment. During the trial, they have full access to plan features. After the trial expires, automatic billing begins unless they cancel. Existing customers can view their subscription status, see upcoming charges, and manage or cancel their subscription.

### Acceptance Scenarios

**Scenario 1: View Available Plans**
1. **Given** a visitor lands on the pricing page, **When** the page loads, **Then** all active subscription plans are displayed with their names, prices, features list, and trial information
2. **Given** plans are displayed, **When** a plan is marked as "most popular", **Then** it displays a visual badge to highlight it

**Scenario 2: Start Free Trial**
1. **Given** an unauthenticated visitor, **When** they click "Start Trial", **Then** they are redirected to login/registration
2. **Given** an authenticated user without active subscription, **When** they select a plan and confirm trial, **Then** a subscription is created with trial status
3. **Given** trial creation is successful, **When** user is redirected to success page, **Then** they see trial end date, first payment date, and access to use the system

**Scenario 3: View Subscription Status**
1. **Given** a user with active trial, **When** they access their dashboard, **Then** they see a badge showing "Trial Active" with days remaining
2. **Given** a user with paid subscription, **When** they access their dashboard, **Then** they see "Active" status with next payment date

**Scenario 4: Cancel Subscription**
1. **Given** a user with active subscription, **When** they request cancellation, **Then** they see a confirmation dialog explaining consequences
2. **Given** user confirms cancellation with optional reason, **When** cancellation processes, **Then** subscription status changes to "canceled" and access terms are displayed

**Scenario 5: Trial Expiration**
1. **Given** a trial period ends, **When** the trial end date is reached, **Then** the system automatically attempts first payment and changes status to "active" if successful

### Edge Cases
- What happens when a user tries to start a second trial for the same product? System must prevent duplicate trials for the same product per company
- How does system handle payment failures after trial? Subscription moves to "past_due" status and user receives notification
- What if user cancels during trial period? Access continues until trial end date, then no billing occurs
- What happens to users with "past_due" status? They receive alerts to update payment information and may have limited access until resolved
- Can users switch plans during trial? [NEEDS CLARIFICATION: Upgrade/downgrade during trial policy not specified]
- What data is retained after cancellation? [NEEDS CLARIFICATION: Data retention period after cancellation not specified - suggested 30 days in docs but needs confirmation]

---

## Requirements

### Functional Requirements

**Pricing Display**
- **FR-001**: System MUST display all active subscription plans with name, description, monthly price, and included features list
- **FR-002**: System MUST show trial duration (e.g., "7 days free") prominently on each plan that offers trial
- **FR-003**: System MUST visually distinguish "most popular" or "recommended" plans with badges or highlighting
- **FR-004**: System MUST display feature comparison showing what each plan tier includes (e.g., user limits, lead capacity, support level)

**Trial Activation**
- **FR-005**: System MUST require user authentication before allowing trial activation
- **FR-006**: System MUST redirect unauthenticated users to login/registration with return path to selected plan
- **FR-007**: System MUST present a checkout confirmation showing selected plan, trial duration, trial end date, and first payment date before activation
- **FR-008**: System MUST create subscription with "trialing" status when user confirms trial
- **FR-009**: System MUST display success confirmation after trial activation with key dates (trial end, first charge)
- **FR-010**: System MUST prevent users from starting duplicate trials for the same product

**Subscription Status Display**
- **FR-011**: System MUST show current subscription status to authenticated users (trial active, active, past due, canceled, suspended, expired)
- **FR-012**: System MUST display days remaining for users in trial period
- **FR-013**: System MUST show next payment date for active paying subscribers
- **FR-014**: System MUST indicate payment amount and billing cycle (monthly, yearly)
- **FR-015**: System MUST provide clear visual indicators (badges, colors) differentiating subscription states

**Subscription Management**
- **FR-016**: Users MUST be able to view complete details of their current subscription including plan name, price, billing cycle, and payment history count
- **FR-017**: Users MUST be able to cancel their subscription from a management interface
- **FR-018**: System MUST require confirmation before processing cancellation
- **FR-019**: System MUST allow users to optionally provide cancellation reason
- **FR-020**: System MUST update subscription status to "canceled" upon successful cancellation
- **FR-021**: System MUST communicate cancellation consequences (access termination, data retention) clearly before user confirms

**Billing Cycles**
- **FR-022**: System MUST support multiple billing cycles (weekly, bi-weekly, monthly, quarterly, semi-annually, yearly)
- **FR-023**: System MUST clearly communicate the selected billing cycle to users before trial activation
- **FR-024**: System MUST calculate first payment date as trial end date plus one day
- **FR-025**: System MUST track payment count and remaining payments (unlimited for recurring subscriptions)

**User Notifications**
- **FR-026**: System MUST notify users when trial is activated with welcome message and instructions
- **FR-027**: System MUST notify users when trial is nearing expiration (suggested 3 days before)
- **FR-028**: System MUST notify users when payment is processed successfully
- **FR-029**: System MUST notify users when payment fails and subscription becomes past due
- **FR-030**: System MUST notify users when subscription is canceled with confirmation

**Access Control**
- **FR-031**: System MUST grant full plan features to users during trial period
- **FR-032**: System MUST continue access for paying subscribers with "active" status
- **FR-033**: System MUST restrict or limit access for subscriptions in "past_due", "suspended", or "expired" status
- **FR-034**: System MUST enforce session limits based on plan tier (e.g., max simultaneous users)

**Responsive Design**
- **FR-035**: Pricing page MUST be fully functional on mobile devices
- **FR-036**: Checkout flow MUST be optimized for mobile interaction
- **FR-037**: Subscription management MUST be accessible from mobile devices
- **FR-038**: System MUST adapt layout for different screen sizes (mobile, tablet, desktop)

### Key Entities

- **Product/Plan**: Represents a subscription tier offered to customers. Includes pricing, features list, maximum user sessions, billing cycle options, trial duration if applicable, and status (active/inactive). Each product may be marked as "most popular" or "recommended" for display purposes.

- **Subscription**: Represents an active or past customer commitment to a product. Tracks current status (trialing, active, past_due, canceled, suspended, expired), billing cycle, payment amount, trial information (has trial, duration, end date, currently in trial flag), payment tracking (next due date, payment count, first/last payment dates), and metadata like description and external references.

- **Trial Period**: Represents the free testing period offered to new subscribers. Includes duration in days, start date, end date, and indicator of whether user is currently in trial. Automatically transitions to paid status when period expires.

- **Company/Customer**: The entity (business) that holds subscriptions. A company can have one or more users but only one active subscription per product type. Used to prevent duplicate trials and manage billing.

- **Payment Information**: Tracks billing events including due dates, successful payments, failed payments, and payment history. Links to external payment gateway records for reconciliation.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (2 items need clarification)
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

**Outstanding Clarifications:**
1. Plan switching during trial period - policy needed
2. Data retention period after cancellation - confirm 30-day retention or specify alternative

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (2 items)
- [x] User scenarios defined
- [x] Requirements generated (38 functional requirements)
- [x] Entities identified (5 key entities)
- [ ] Review checklist passed (pending 2 clarifications)

---

## Dependencies and Assumptions

### Dependencies
- Authentication system must be operational for trial activation
- Payment gateway integration must be configured for billing after trial
- User must belong to a company/organization entity for subscription association
- Email notification system for trial and billing communications

### Assumptions
- Trial is only offered once per product per company
- Users with active subscriptions cannot start new trials for same product
- Trial access includes full feature set of selected plan
- Payment gateway handles actual payment processing and webhooks
- System maintains accurate trial end date calculation
- Multiple users from same company share one subscription
- Cancellation takes effect immediately for trial, or at next billing date for active subscriptions
- System automatically transitions from trial to active status on trial expiration

### Business Rules
- Trial periods are configurable per product (7, 14 days, etc.)
- First payment occurs one day after trial ends
- Billing is recurring unless subscription is canceled
- Payment failures result in "past_due" status with opportunity to retry
- Suspended or expired subscriptions may require reactivation or new subscription
- Popular/recommended badges are manually configured per product
- Pricing is displayed in Brazilian Reais (R$)

---

## 💰 Complementary System: Credits and Lead Marketplace

**Integration Point**: This feature includes an additional monetization model alongside subscriptions.

### Overview
In addition to subscription plans, the system supports a **credit-based marketplace** where companies can:
1. Purchase credit packages (one-time payments)
2. Use credits to buy access to leads from the marketplace
3. Manage credit balance and transaction history

### Business Model

**Credit System**:
- 1 credit = R$ 0,01 (1 centavo)
- Credits are purchased in packages (not subscriptions)
- Credits do not expire
- Credits are non-refundable

**Credit Packages** (Examples from backend seed data):
- Starter: R$ 50 → 5,000 credits (100 leads @ R$ 0.50 each)
- Basic: R$ 100 → 10,000 credits (250 leads @ R$ 0.40 each)
- Pro: R$ 250 → 24,750 credits + 1,650 bonus (750 leads @ R$ 0.33 each) ⭐ Most Popular
- Business: R$ 600 → 60,000 credits + 4,000 bonus (2,000 leads)
- Enterprise: R$ 1,250 → 125,000 credits + 10,000 bonus (5,000 leads)

**Lead Marketplace**:
- Individual leads have variable costs (typically 30-50 credits = R$ 0.30 - R$ 0.50)
- Companies can only purchase each lead once
- Lead access is recorded with configurable view limits (default: 999 views)
- Lead status in marketplace: `publico`, `vendido`, `privado`, `indisponivel`

### Additional User Scenarios

**Scenario 6: Purchase Credit Package**
1. **Given** an authenticated company user, **When** they visit the credits purchase page, **Then** they see all available credit packages with pricing, included leads, and cost per lead
2. **Given** user selects a package, **When** payment is confirmed via payment gateway, **Then** credits are automatically added to company balance
3. **Given** package includes bonus credits, **When** credits are added, **Then** both base and bonus credits are credited separately for tracking

**Scenario 7: Browse and Purchase Leads**
1. **Given** a company with available credits, **When** they access the lead marketplace, **Then** they see available leads with preview information (partial phone, masked email, location, segment)
2. **Given** user selects a lead to purchase, **When** they confirm purchase, **Then** system checks credit balance, debits cost, and grants full access to lead details
3. **Given** insufficient credits, **When** user attempts purchase, **Then** system displays error and offers link to purchase more credits

**Scenario 8: View Credit Balance and History**
1. **Given** an authenticated company, **When** they view their dashboard, **Then** they see current credit balance displayed prominently
2. **Given** user accesses credit history, **When** history loads, **Then** they see all transactions (purchases, usage, bonuses) with dates and descriptions
3. **Given** credit balance is displayed, **When** user views it, **Then** approximate number of leads purchasable is shown for quick reference

### Additional Functional Requirements

**Credit Package Display**
- **FR-039**: System MUST display all active credit packages with name, price, total credits, bonus credits (if any), included leads count, and cost per lead
- **FR-040**: System MUST calculate and display savings/discount percentage for packages with bonuses
- **FR-041**: System MUST visually highlight the "most popular" credit package
- **FR-042**: System MUST show comparison between packages (cost per lead, total value)

**Credit Purchase**
- **FR-043**: System MUST integrate with payment gateway for one-time credit package payments
- **FR-044**: System MUST distinguish credit purchases from subscription payments in payment processing
- **FR-045**: System MUST automatically credit company account when payment is confirmed via webhook
- **FR-046**: System MUST separate base credits from bonus credits in transaction records
- **FR-047**: System MUST prevent duplicate credit additions for the same payment

**Credit Balance Management**
- **FR-048**: System MUST display real-time credit balance to authenticated company users
- **FR-049**: System MUST show balance in both credits and equivalent monetary value (R$)
- **FR-050**: System MUST provide estimated number of leads purchasable with current balance
- **FR-051**: System MUST display statistics: total purchased, total spent, total bonus received
- **FR-052**: System MUST show last transaction details in balance display

**Lead Marketplace**
- **FR-053**: System MUST display available leads with preview information (masked sensitive data)
- **FR-054**: System MUST show lead cost in credits and equivalent currency
- **FR-055**: System MUST filter leads by segment, location, and other attributes
- **FR-056**: System MUST indicate if user has sufficient credits before allowing purchase
- **FR-057**: System MUST prevent purchase of leads already owned by the company
- **FR-058**: System MUST display lead status (available, sold, unavailable)

**Lead Purchase**
- **FR-059**: System MUST validate sufficient credit balance before processing lead purchase
- **FR-060**: System MUST debit credits atomically when lead is purchased
- **FR-061**: System MUST grant immediate access to full lead details after purchase
- **FR-062**: System MUST record purchase in lead access history with timestamp
- **FR-063**: System MUST update credit balance display immediately after purchase
- **FR-064**: System MUST show clear error if balance is insufficient with prompt to buy credits

**Transaction History**
- **FR-065**: System MUST provide complete transaction history for all credit movements
- **FR-066**: System MUST categorize transactions by type (purchase, usage, bonus, refund)
- **FR-067**: System MUST show transaction date, amount, description, and remaining balance
- **FR-068**: System MUST allow filtering and searching transaction history

**Access Control for Purchased Leads**
- **FR-069**: System MUST track number of times purchased lead has been viewed
- **FR-070**: System MUST enforce configurable view limits per purchased lead (default: 999)
- **FR-071**: System MUST display list of all leads owned by company
- **FR-072**: System MUST show purchase date and access count for each owned lead

### Additional Key Entities

- **Credit Package (Produto)**: Represents a purchasable package of credits. Includes package name, description, price in centavos, quantity of credits, bonus credits, active status, and display order. Each package is a one-time purchase product, not a subscription.

- **Company Credit Balance**: Tracks the current credit balance for a company in centavos. Updated atomically with each credit purchase or lead purchase. Maintains audit trail of all balance changes.

- **Credit Transaction**: Records all credit movements (purchases, expenditures, bonuses). Includes transaction type, quantity in centavos, timestamp, description, related product or lead reference, and user who initiated transaction.

- **Lead**: Represents a business contact available in the marketplace. Includes company name, contact info (phone, email), location, business segment, marketplace status, and cost in credits. Status controls availability for purchase.

- **Lead Access Record**: Tracks which companies have purchased access to which leads. Includes purchase timestamp, cost paid, view count, view limit, and access type (purchased, trial, bonus). Enforces one-purchase-per-company rule.

### Integration with Subscription System

**Coexistence Rules**:
- Companies can have BOTH an active subscription AND credit balance simultaneously
- Subscription provides ongoing access to platform features
- Credits provide pay-per-lead access to marketplace inventory
- Payment gateway must distinguish between:
  - Recurring subscription payments (`payment.subscription` populated)
  - One-time credit package purchases (`payment.subscription` null, `externalReference` = product ID)

**User Experience Flow**:
1. Company signs up → Starts subscription trial (free platform access)
2. Company browses leads → Needs credits to purchase
3. Company buys credit package → One-time payment processed
4. Company uses credits → Purchases individual leads
5. Subscription renews monthly → Platform access continues
6. Credits remain available → No expiration, used as needed

### Edge Cases for Credit System
- What happens if payment webhook is delayed? Credits are added when webhook is received; user may experience delay before balance updates
- Can credits be refunded? No, credits are non-refundable per business rules
- What if lead is no longer available after purchase confirmation? System validates availability before debiting credits; transaction is atomic
- Can companies transfer credits to other companies? No, credits are company-specific
- What happens to credits when subscription is canceled? Credits remain available and can still be used to purchase leads
- Can users purchase the same lead multiple times? No, system enforces one-purchase-per-company per lead

### API Endpoints (Backend Ready)

**Credit Management**:
- `GET /api/v1/credits/balance?empresaId={uuid}` - Get current credit balance and statistics
- `GET /api/v1/credits/packages` - List all available credit packages
- `POST /api/v1/credits/purchase-lead` - Purchase lead access using credits

**Webhook Integration**:
- Payment gateway webhook distinguishes credit purchases by checking `payment.subscription === null`
- Uses `payment.externalReference` to identify product/package
- Automatically triggers credit addition via `AddCreditsToEmpresaUseCase`

### Technical Notes for Frontend Implementation
- Credit amounts are stored in centavos (integer) to avoid floating-point errors
- All API responses include formatted currency strings (e.g., "R$ 150,00")
- Real-time balance updates recommended via polling (30-60 second intervals) or websockets
- Transaction history should be paginated for companies with high transaction volume
- Lead marketplace should implement virtual scrolling for performance with large datasets
- Purchase confirmation should use optimistic UI updates with rollback on error
