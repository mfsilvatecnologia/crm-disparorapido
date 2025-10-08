# Tasks: Página de Vendas com Sistema de Assinaturas e Créditos

**Input**: Design documents from `/specs/004-pagina-de-vendas/`
**Prerequisites**### Fase 3.4: Validation Schemas (5 tarefas)

- [X] **T048** - Criar Zod schemas para Product
- [X] **T049** - Criar Zod schemas para Subscription
- [X] **T050** - Criar Zod schemas para PaymentHistory
- [X] **T051** - Criar Zod schemas para CreditTransaction
- [X] **T052** - Criar Zod schemas para Lead/LeadAccessmd ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Loaded: React 18.3, TypeScript 5.8, TanStack Query, Axios
   → Extracted: Tech stack, feature-based structure, testing tools
2. Load optional design doc**Total Tasks**: 142
- Setup: 6 tasks (T001-T006)
- Tests: 31 tasks (T011-T041)
- Types & Validation: 11 tasks (T042-T052)
- Services: 6 tasks (T053-T058)
- API Clients: 5 tasks (T059-T063)
- Hooks: 9 tasks (T064-T072)
- Components: 20 tasks (T073-T092)
- Pages: 5 tasks (T093-T097)
- Integration: 15 tasks (T104-T115)
- Polish & Validation: 34 tasks (T116-T142)

**Estimated Parallel Batches**: 12-15 batches (many tasks can run concurrently)
**Estimated Completion Time**: 3-4 weeks with proper parallelization

---

*Tasks generated from design documents on 2025-10-04*
*Updated for API-first frontend architecture*
*Ready for execution via /implement command*odel.md: 8 entities (Product, Subscription, PaymentHistory, CreditPackage, etc.)
   → contracts/: 3 files (products, subscriptions, credits) = 15 endpoints total
   → research.md: API integration, state management patterns
   → quickstart.md: 15 test scenarios (8 subscriptions + 7 credits/marketplace)
3. Generate tasks by category:
   → Setup: Dependencies, API client config
   → Tests: 18 contract tests + 15 integration tests (TDD)
   → Core: TypeScript types, services, components
   → Integration: API client, state management
   → Polish: Performance, docs, cleanup
4. Apply task rules:
   → Different files = [P] for parallel
   → Tests before implementation (TDD)
   → Types before services before components
5. Number tasks sequentially (T001-T078)
6. Dependencies mapped and validated
7. Parallel execution examples provided
8. ✅ All contracts have tests, all entities have TypeScript types
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included in descriptions

---

## ⚠️ IMPORTANT: API FIRST Architecture

**This project follows API FIRST principles:**
- ✅ All payment gateway (Asaas) communication is handled by the **backend**
- ✅ Frontend **NEVER** calls Asaas API directly
- ✅ All business logic, validations, and external integrations are in the backend
- ✅ Frontend only calls backend API endpoints
- ✅ Backend returns payment URLs, processes webhooks, and manages payment state
- ❌ No Asaas credentials or API keys in frontend code
- ❌ No direct HTTP calls to external payment gateways from frontend

**Payment Flow:**
1. Frontend requests checkout → Backend API
2. Backend creates payment with Asaas → Returns payment URL
3. Frontend redirects user to payment URL
4. User completes payment on Asaas
5. Asaas sends webhook → Backend
6. Backend processes webhook → Updates database
7. Frontend receives updates via WebSocket/SSE or polling

---

## Phase 3.1: Setup & Dependencies

- [X] **T001** Create feature folder structure in `src/features/sales/` with subdirectories: `components/{subscriptions,credits,marketplace}`, `hooks/{subscriptions,credits,marketplace}`, `services/`, `types/`, `contracts/`, `pages/`, `api/`
- [X] **T002** Install dependencies: `@tanstack/react-query@5.89`, `react-hook-form@7.62`, `zod@3.25`, `axios@1.11`, `react-hot-toast@2.6`
- [ ] **T003** [P] Configure ESLint rules for new feature in `.eslintrc.js` (add sales feature to paths)
- [ ] **T004** [P] Configure Vitest test suites: contract, integration, unit in `vitest.config.ts`
- [X] **T005** ~~Configure Asaas API client~~ **REMOVED** - API FIRST: All payment gateway communication goes through backend
- [X] **T006** [P] Setup API client base configuration in `src/lib/api-client.ts` with axios instance, interceptors for auth tokens, error handling (reuse existing if available)

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Subscriptions)
- [X] **T011** [P] Contract test `GET /api/products` in `tests/contract/features/sales/subscriptions/products.contract.test.ts` - validates schema for listing active products with pricing, features, trial info
- [X] **T012** [P] Contract test `GET /api/products/:id` in `tests/contract/features/sales/subscriptions/products-detail.contract.test.ts` - validates single product schema with full details
- [X] **T013** [P] Contract test `POST /api/subscriptions/trial` in `tests/contract/features/sales/subscriptions/trials.contract.test.ts` - validates trial creation request/response with trial dates calculation
- [X] **T014** [P] Contract test `GET /api/subscriptions/current` in `tests/contract/features/sales/subscriptions/subscriptions.contract.test.ts` - validates current subscription schema with status, dates, payment info
- [X] **T015** [P] Contract test `PATCH /api/subscriptions/:id/cancel` in `tests/contract/features/sales/subscriptions/cancellation.contract.test.ts` - validates cancellation request with optional reason
- [ ] **T016** [P] Contract test `GET /api/subscriptions/:id/status` in `tests/contract/features/sales/subscriptions/status.contract.test.ts` - validates detailed status response

### Contract Tests (Credits & Marketplace)
- [X] **T017** [P] Contract test `GET /api/v1/credits/balance` in `tests/contract/features/sales/credits/balance.contract.test.ts` - validates balance response with statistics and last transaction
- [X] **T018** [P] Contract test `GET /api/v1/credits/packages` in `tests/contract/features/sales/credits/packages.contract.test.ts` - validates credit packages list schema with pricing, bonuses
- [ ] **T019** [P] Contract test `POST /api/v1/credits/purchase-lead` in `tests/contract/features/sales/credits/purchase-lead.contract.test.ts` - validates lead purchase request/response and error cases (insufficient balance, already purchased)
- [ ] **T020** [P] Contract test `GET /api/v1/leads/marketplace` in `tests/contract/features/sales/marketplace/leads.contract.test.ts` - validates marketplace leads list with pagination and masking
- [ ] **T021** [P] Contract test `GET /api/v1/leads/:id/preview` in `tests/contract/features/sales/marketplace/lead-preview.contract.test.ts` - validates lead preview with masked data (phone, email)
- [ ] **T022** [P] Contract test `GET /api/v1/leads/purchased` in `tests/contract/features/sales/marketplace/purchased-leads.contract.test.ts` - validates purchased leads list with full unmasked data

### Integration Tests (Subscriptions - from quickstart.md)
- [ ] **T023** [P] Integration test "View Pricing Plans" in `tests/integration/features/sales/subscriptions/pricing-flow.test.tsx` - Scenario 1: unauthenticated user sees all plans with pricing, features, trial duration, CTA buttons
- [ ] **T024** [P] Integration test "Start Trial" in `tests/integration/features/sales/subscriptions/trial-activation.test.tsx` - Scenario 2: user flow from pricing → login → checkout → trial activation → success page
- [ ] **T025** [P] Integration test "View Subscription Status in Trial" in `tests/integration/features/sales/subscriptions/trial-status.test.tsx` - Scenario 3: dashboard shows trial banner with days remaining, next payment info
- [ ] **T026** [P] Integration test "Cancel Subscription During Trial" in `tests/integration/features/sales/subscriptions/cancellation-flow.test.tsx` - Scenario 4: cancel dialog, reason input, confirmation, status update
- [ ] **T027** [P] Integration test "Trial to Active Status Update" in `tests/integration/features/sales/subscriptions/trial-expiration.test.tsx` - Scenario 5: UI updates when webhook processes trial → active transition
- [ ] **T028** [P] Integration test "Prevent Duplicate Trial" in `tests/integration/features/sales/subscriptions/duplicate-trial.test.tsx` - Scenario 6: error when trying second trial for same product, show direct subscription option
- [ ] **T029** [P] Integration test "Session Limit Enforcement" in `tests/integration/features/sales/subscriptions/session-limit.test.tsx` - Scenario 7: block login when max sessions reached, show upgrade option
- [ ] **T030** [P] Integration test "Responsive Design Mobile" in `tests/integration/features/sales/subscriptions/responsive.test.tsx` - Scenario 8: pricing cards stack vertically, features expandable, CTA fixed bottom

### Integration Tests (Credits & Marketplace - from quickstart.md)
- [ ] **T031** [P] Integration test "Purchase Credit Package" in `tests/integration/features/sales/credits/package-purchase.test.tsx` - Scenario 9: view packages, select, confirm, call backend API, redirect to payment URL returned by backend
- [ ] **T032** [P] Integration test "View Credit Balance" in `tests/integration/features/sales/credits/balance-display.test.tsx` - Scenario 10: dashboard widget shows balance, statistics, estimated leads count
- [ ] **T033** [P] Integration test "Browse Marketplace Leads" in `tests/integration/features/sales/marketplace/browse-leads.test.tsx` - Scenario 11: marketplace grid, filters (segment, city), masked preview, pagination
- [ ] **T034** [P] Integration test "Purchase Lead with Credits" in `tests/integration/features/sales/marketplace/purchase-lead.test.tsx` - Scenario 12: buy lead, debit credits, reveal full data, update balance, toast notification
- [ ] **T035** [P] Integration test "Insufficient Credits Error" in `tests/integration/features/sales/marketplace/insufficient-credits.test.tsx` - Scenario 13: disabled button, error message, link to buy credits
- [ ] **T036** [P] Integration test "Prevent Duplicate Lead Purchase" in `tests/integration/features/sales/marketplace/duplicate-lead.test.tsx` - Scenario 14: already purchased badge, "View Details" instead of "Buy"
- [ ] **T037** [P] Integration test "Subscription + Credits Coexistence" in `tests/integration/features/sales/integration/dual-system.test.tsx` - Scenario 15: dashboard shows both subscription widget and credits widget, all actions available

### Performance Tests
- [ ] **T038** [P] Performance test "Pricing page load < 2s" in `tests/integration/features/sales/performance/pricing-load.test.tsx` - Measure time from render to content visible
- [ ] **T039** [P] Performance test "Checkout transitions < 500ms" in `tests/integration/features/sales/performance/checkout-transitions.test.tsx` - Measure time between checkout steps
- [ ] **T040** [P] Performance test "Marketplace load < 2s" in `tests/integration/features/sales/performance/marketplace-load.test.tsx` - Measure marketplace page initial load
- [ ] **T041** [P] Performance test "Lead purchase < 1s" in `tests/integration/features/sales/performance/lead-purchase.test.tsx` - Measure complete purchase flow from click to confirmation

---

### Fase 3.3: Types & Interfaces (6 tarefas)

- [X] **T042** - Criar tipos TypeScript para Product
- [X] **T043** - Criar tipos TypeScript para Subscription
- [X] **T044** - Criar tipos TypeScript para PaymentHistory
- [X] **T045** - Criar tipos TypeScript para CreditTransaction
- [X] **T046** - Criar tipos TypeScript para Lead
- [X] **T047** - Criar tipos TypeScript para LeadAccess

---

## Phase 3.4: Core Implementation - Zod Validation Schemas

- [X] **T048** [P] Product validation schemas in `src/features/sales/schemas/product.schema.ts` - define ProductSchema, CreateProductSchema using Zod based on API contracts
- [X] **T049** [P] Subscription validation schemas in `src/features/sales/schemas/subscription.schema.ts` - define SubscriptionSchema, CreateTrialSubscriptionSchema, CancelSubscriptionSchema with trial date validation refinements
- [X] **T050** [P] Payment validation schema in `src/features/sales/schemas/payment.schema.ts` - define PaymentHistorySchema with status and date validations
- [X] **T051** [P] Credits validation schemas in `src/features/sales/schemas/credit.schema.ts` - define CreditPackageSchema, CreditBalanceSchema, PurchaseLeadSchema
- [X] **T052** [P] Marketplace validation schemas in `src/features/sales/schemas/lead.schema.ts` - define LeadSchema, LeadPreviewSchema, PurchasedLeadSchema with masking logic

---

## Phase 3.5: Core Implementation - Frontend Services (API Integration)

- [X] **T053** Products service in `src/features/sales/services/productService.ts` - implement getActiveProducts(), getProductById() using axios with error handling, formatPrice helper, getBillingCycleLabel
- [X] **T054** Subscriptions service in `src/features/sales/services/subscriptionService.ts` - implement createTrialSubscription(), getCurrentSubscription(), cancelSubscription(), calculateNextDueDate(), isTrialActive(), getDaysRemainingInTrial() helpers calling backend API
- [X] **T055** Trial validation service in `src/features/sales/services/paymentService.ts` - implement payment history operations
- [X] **T056** Credits service in `src/features/sales/services/creditService.ts` - implement getCreditBalance(), getCreditPackages(), formatCreditsAsCurrency(), calculateLeadsFromCredits() calling backend API
- [X] **T057** Marketplace service in `src/features/sales/services/leadService.ts` - implement getMarketplaceLeads() with filters and pagination, maskLeadForPreview(), getPurchasedLeads() calling backend API
- [X] **T058** Lead purchase service in `src/features/sales/services/index.ts` - barrel export for all services

---

## Phase 3.6: API Integration - Client Methods

### Subscriptions API Client
- [X] **T059** Products API client in `src/features/sales/api/productsApi.ts` - implement fetchProducts(), fetchProductById() using axios instance with error handling
- [X] **T060** Subscriptions API client in `src/features/sales/api/subscriptionsApi.ts` - implement createTrialSubscription(), fetchCurrentSubscription(), cancelSubscription() API calls
- [X] **T061** Subscription status API client in `src/features/sales/api/subscriptionsApi.ts` - implement fetchSubscriptionStatus() API call

### Credits & Marketplace API Client
- [X] **T062** Credits API client in `src/features/sales/api/creditsApi.ts` - implement fetchCreditBalance(), fetchCreditPackages() API calls
- [X] **T063** Marketplace API client in `src/features/sales/api/marketplaceApi.ts` - implement fetchMarketplaceLeads(), fetchLeadPreview(), purchaseLead(), fetchPurchasedLeads() API calls

---

## Phase 3.7: Core Implementation - Frontend Hooks (TanStack Query)

### Subscription Hooks

- [X] **T064** [P] useProducts hook in `src/features/sales/hooks/subscriptions/useProducts.ts` - fetch products with useQuery, staleTime 1h, enabled by default
- [X] **T065** [P] useSubscription hook in `src/features/sales/hooks/subscriptions/useSubscription.ts` - fetch current subscription with refetchInterval 30s when trialing, compute isInTrial, daysRemaining
- [X] **T066** [P] useTrialActivation hook in `src/features/sales/hooks/subscriptions/useTrialActivation.ts` - useMutation for POST /api/subscriptions/trial, invalidate subscription query on success
- [X] **T067** [P] useCancelSubscription hook in `src/features/sales/hooks/subscriptions/useCancelSubscription.ts` - useMutation for PATCH cancel, invalidate subscription query, show toast

### Credits & Marketplace Hooks

- [X] **T068** [P] useCreditBalance hook in `src/features/sales/hooks/credits/useCreditBalance.ts` - fetch balance with refetchInterval 60s, compute estimated leads count
- [X] **T069** [P] useCreditPackages hook in `src/features/sales/hooks/credits/useCreditPackages.ts` - fetch packages with staleTime 1h
- [X] **T070** [P] usePurchaseLead hook in `src/features/sales/hooks/marketplace/usePurchaseLead.ts` - useMutation for POST purchase-lead, optimistic update balance, invalidate queries, toast on success/error
- [X] **T071** [P] useMarketplaceLeads hook in `src/features/sales/hooks/marketplace/useMarketplaceLeads.ts` - fetch marketplace leads with filters state, pagination, keepPreviousData
- [X] **T072** [P] usePurchasedLeads hook in `src/features/sales/hooks/marketplace/usePurchasedLeads.ts` - fetch purchased leads for company

---

## Phase 3.8: Core Implementation - Frontend Components

### Subscription Components

- [X] **T073** [P] PricingCard component in `src/features/sales/components/subscriptions/PricingCard.tsx` - display plan with name, price, features list, trial badge, CTA button, "Most Popular" badge conditional
- [X] **T074** [P] PricingTable component in `src/features/sales/components/subscriptions/PricingTable.tsx` - grid layout responsive (1 col mobile, 2 col tablet, 3+ desktop), map over products
- [X] **T075** [P] FeatureComparison component in `src/features/sales/components/subscriptions/FeatureComparison.tsx` - comparison table (desktop) and swipe carousel (mobile)
- [X] **T076** [P] PlanSelection component in `src/features/sales/components/subscriptions/CheckoutFlow/PlanSelection.tsx` - checkout step 1, display selected plan summary
- [X] **T077** [P] CheckoutConfirmation component in `src/features/sales/components/subscriptions/CheckoutFlow/CheckoutConfirmation.tsx` - show trial dates, first payment date, confirm button
- [X] **T078** [P] SuccessPage component in `src/features/sales/components/subscriptions/CheckoutFlow/SuccessPage.tsx` - trial activation success with dates, welcome message
- [X] **T079** [P] TrialBanner component in `src/features/sales/components/subscriptions/TrialBanner.tsx` - dashboard banner with days remaining, next payment, manage link
- [X] **T080** [P] StatusBadge component in `src/features/sales/components/subscriptions/SubscriptionDashboard/StatusBadge.tsx` - colored badge based on status (trialing=blue, active=green, past_due=yellow, canceled=red)
- [X] **T081** [P] SubscriptionDetails component in `src/features/sales/components/subscriptions/SubscriptionDashboard/SubscriptionDetails.tsx` - full subscription info panel with plan, status, dates, payment history
- [X] **T082** CancelDialog component in `src/features/sales/components/subscriptions/SubscriptionDashboard/CancelDialog.tsx` - modal with warning, consequences, reason textarea, confirm/cancel buttons, call useCancelSubscription hook

### Credit Components

- [X] **T083** [P] CreditBalanceCard component in `src/features/sales/components/credits/CreditBalanceCard.tsx` - widget for dashboard showing balance, estimated leads, statistics (total bought/spent/bonus), "Buy Credits" button
- [X] **T084** [P] CreditPackagesGrid component in `src/features/sales/components/credits/CreditPackagesGrid.tsx` - responsive grid of credit packages with selection state
- [X] **T085** [P] PackageCard component in `src/features/sales/components/credits/PackageCard.tsx` - individual package card with price, credits, bonus, cost per lead, "Most Popular" badge, click to select
- [X] **T086** [P] TransactionHistory component in `src/features/sales/components/credits/TransactionHistory.tsx` - paginated list of credit transactions with type icons, amounts, dates
- [X] **T087** [P] PurchasePackageModal component in `src/features/sales/components/credits/PurchasePackageModal.tsx` - confirmation modal showing package details, total, confirm button that calls backend API to initiate payment, redirect to payment URL received from backend response

### Marketplace Components

- [X] **T088** [P] LeadMarketplaceGrid component in `src/features/sales/components/marketplace/LeadMarketplaceGrid.tsx` - grid of lead cards with filters sidebar, pagination controls
- [X] **T089** [P] LeadMarketplaceCard component in `src/features/sales/components/marketplace/LeadMarketplaceCard.tsx` - lead card with masked preview, cost, status badge, buy/view button based on ownership
- [X] **T090** [P] LeadPreview component in `src/features/sales/components/marketplace/LeadPreview.tsx` - reusable component for masked lead data (phone ******, email ***@***.com)
- [X] **T091** [P] PurchaseLeadModal component in `src/features/sales/components/marketplace/PurchaseLeadModal.tsx` - confirmation modal with lead preview, cost, balance before/after, confirm button calling usePurchaseLead
- [X] **T092** [P] LeadFilters component in `src/features/sales/components/marketplace/LeadFilters.tsx` - filter form with segmento select, cidade input, estado select, apply filters button

---

## Phase 3.9: Core Implementation - Frontend Pages

- [X] **T093** PricingPage in `src/features/sales/pages/PricingPage.tsx` - use useProducts hook, render PricingTable and FeatureComparison, handle unauthenticated state
- [X] **T094** CheckoutPage in `src/features/sales/pages/CheckoutPage.tsx` - multi-step flow: PlanSelection → CheckoutConfirmation → useTrialActivation → redirect to success
- [X] **T095** SubscriptionManagementPage in `src/features/sales/pages/SubscriptionManagementPage.tsx` - use useSubscription, render SubscriptionDetails, CancelDialog, payment history
- [X] **T096** CreditPackagesPage in `src/features/sales/pages/CreditPackagesPage.tsx` - use useCreditPackages, render CreditPackagesGrid, handle package selection and purchase
- [X] **T097** MarketplacePage in `src/features/sales/pages/MarketplacePage.tsx` - use useMarketplaceLeads and useCreditBalance, render LeadMarketplaceGrid with filters, handle purchase flow

---

## Phase 3.10: Integration - Payment Gateway & External Services

- [ ] **T104** Payment redirect handler in `src/features/sales/services/paymentService.ts` - implement initiateCheckout() to call backend API that generates payment link (backend handles Asaas), redirect user to payment URL received from backend
- [ ] **T105** Payment callback handler in `src/features/sales/pages/PaymentCallbackPage.tsx` - handle return from payment gateway, call backend to verify payment status, update UI accordingly
- [ ] **T106** Webhook notifications handler in `src/features/sales/hooks/usePaymentWebhook.ts` - listen to backend webhook events via WebSocket or Server-Sent Events to update subscription/credit status in real-time (backend processes Asaas webhooks)

---

## Phase 3.11: Integration - Notifications & Real-time Updates

- [ ] **T107** Toast notification system in `src/contexts/NotificationContext.tsx` - create context for toast notifications using react-hot-toast, localStorage for history (last 10)
- [ ] **T108** Real-time subscription updates in `src/features/sales/hooks/useSubscriptionUpdates.ts` - implement polling or WebSocket connection to receive subscription status changes
- [ ] **T109** Credit balance updates in `src/features/sales/hooks/useCreditUpdates.ts` - implement real-time credit balance updates when purchases/usage occur

---

## Phase 3.12: Integration - Authentication & Authorization

- [ ] **T110** Subscription-based route protection in `src/features/sales/guards/SubscriptionGuard.tsx` - check if user has active subscription before allowing access to premium features
- [ ] **T111** Credit balance validation in `src/features/sales/guards/CreditGuard.tsx` - verify user has sufficient credits before allowing marketplace actions
- [ ] **T112** Role-based subscription management in `src/features/sales/hooks/useSubscriptionPermissions.ts` - verify user role (admin/owner) before allowing subscription cancellation or changes

---

## Phase 3.13: Integration - React Router & Navigation

- [X] **T113** Add sales routes to React Router in `src/App.tsx` - register routes: /pricing (public), /checkout/:productId (protected), /subscription (protected), /credits/packages (protected), /marketplace (protected)
- [X] **T114** Protected route wrapper in `src/components/ProtectedRoute.tsx` - check auth before rendering sales pages, redirect to /login with return path
- [X] **T115** Navigation menu updates in `src/layouts/MainLayout.tsx` - add "Pricing" to public nav, "My Subscription" and "Marketplace" to authenticated user menu, "Credits" badge with balance in header

---

## Phase 3.14: Polish - Unit Tests & Edge Cases

- [ ] **T116** [P] Unit test for trial date calculations in `tests/unit/features/sales/utils/trial-calculations.test.ts` - test calculateNextDueDate() for all billing cycles, getDaysRemainingInTrial() edge cases
- [ ] **T117** [P] Unit test for price formatting in `tests/unit/features/sales/utils/formatting.test.ts` - test formatPrice() with various centavo amounts, formatCreditsAsCurrency()
- [ ] **T118** [P] Unit test for subscription state transitions in `tests/unit/features/sales/utils/state-transitions.test.ts` - validate allowed/disallowed status changes, error on invalid transitions
- [ ] **T119** [P] Unit test for lead masking in `tests/unit/features/sales/utils/masking.test.ts` - test maskLeadForPreview() with various phone/email formats
- [ ] **T120** [P] Unit test for credit balance calculations in `tests/unit/features/sales/utils/credit-calculations.test.ts` - test balance computation logic, statistics calculation
- [ ] **T121** [P] Unit test for API error handling in `tests/unit/features/sales/services/error-handling.test.ts` - test axios interceptors, error transformations, retry logic

---

## Phase 3.15: Polish - Performance & Optimization

- [ ] **T122** React Query caching strategy in `src/lib/queryClient.ts` - configure staleTime and cacheTime for products (1h), subscriptions (5min), marketplace leads (10min)
- [ ] **T123** Lazy loading for marketplace - implement virtual scrolling in LeadMarketplaceGrid using react-window for large lead lists (>100 items)
- [ ] **T124** Image optimization for pricing page - optimize any hero images, use WebP format, lazy load below-the-fold content
- [ ] **T125** Bundle size analysis - run `npm run build` and analyze bundle, code-split marketplace page, lazy load heavy dependencies
- [ ] **T126** Memoization optimization - add React.memo to list components, useMemo for computed values, useCallback for event handlers

---

## Phase 3.16: Polish - Documentation & Cleanup

- [ ] **T127** [P] Component documentation in `docs/components.md` - document all sales components with props, usage examples, screenshots
- [ ] **T128** [P] Hooks documentation in `docs/hooks.md` - document custom hooks, parameters, return values, usage patterns
- [ ] **T129** [P] Update README.md - add Sales & Subscriptions feature to features list, update env vars needed (API endpoints), setup instructions
- [ ] **T130** Remove code duplication - extract shared validation logic, create reusable form components, consolidate price formatting utils
- [ ] **T131** ESLint/Prettier cleanup - run `npm run lint:fix` and `npm run format` across all new files
- [ ] **T132** Remove console.logs and debug code - search and remove any console.log, debugger statements, commented code blocks

---

## Phase 3.17: Validation & Final Testing

- [ ] **T133** Run all contract tests - execute `npm run test:contract` and verify all 12 contract tests pass
- [ ] **T134** Run all integration tests - execute `npm run test:integration` and verify all 15 integration scenarios pass
- [ ] **T135** Run all unit tests - execute `npm run test:unit` and verify all unit tests pass
- [ ] **T136** Manual testing - follow quickstart.md scenarios 1-15 manually in browser, verify each flow works end-to-end
- [ ] **T137** Performance validation - run performance tests, verify pricing page <2s, checkout <500ms, marketplace <2s, lead purchase <1s
- [ ] **T138** Accessibility audit - run axe-core or Lighthouse, ensure WCAG 2.1 AA compliance, keyboard navigation works, ARIA labels present
- [ ] **T139** Mobile testing - test on real devices (iOS Safari, Android Chrome), verify responsive layouts, touch targets 44x44px minimum
- [ ] **T140** Cross-browser testing - test on Chrome, Firefox, Safari, Edge, verify no browser-specific issues
- [ ] **T141** Security audit - verify JWT validation, secure token storage, CORS configured, no sensitive data in logs/errors
- [ ] **T142** E2E testing - use Playwright to automate complete user flows from pricing to trial activation to marketplace purchase

---

## Dependencies

**Setup Phase (T001-T006)**
- T001 (structure) blocks T042-T098 (all implementation)
- T002 (dependencies) blocks T011-T041 (all tests)
- ~~T005 (Asaas config)~~ **REMOVED** - API FIRST architecture
- T006 (API config) blocks T059-T063 (API client methods)

**Tests Phase (T011-T041)**
- ALL tests (T011-T041) MUST be written and FAILING before ANY implementation
- Tests block their corresponding implementation tasks

**Types Phase (T042-T047)**
- T042-T047 (TypeScript types) block T053-T058 (services)
- Types block T048-T052 (Zod schemas)

**Services Phase (T053-T058)**
- T053 (productsService) blocks T059 (products API client)
- T054-T055 (subscriptionsService) block T060-T061 (subscriptions API client)
- T056 (creditsService) blocks T062 (credits API client)
- T057-T058 (marketplace/purchase services) block T063 (marketplace API client)
- Services block T064-T072 (frontend hooks)

**API Client Phase (T059-T063)**
- API clients block T064-T072 (hooks - need working API integration)

**Hooks Phase (T064-T072)**
- T064-T067 (subscription hooks) block T073-T082 (subscription components)
- T068-T070 (credit hooks) block T083-T087 (credit components)
- T071-T072 (marketplace hooks) block T088-T092 (marketplace components)

**Components Phase (T073-T092)**
- Components block T093-T097 (pages)

**Pages Phase (T093-T097)**
- Pages block T113 (routing)

**Integration Phase (T104-T115)**
- T104-T106 (Payment) can run parallel with T107-T109 (notifications) and T110-T112 (auth)
- All integration blocks T133 (final testing)

**Polish Phase (T116-T142)**
- T116-T121 (unit tests) can run parallel
- T122-T126 (performance) can run parallel
- T127-T132 (docs) can run parallel
- All polish blocks T133-T142 (validation)

---

## Parallel Execution Examples

### Phase 3.2 - All Contract Tests (Different Files)
```bash
# Launch T011-T022 together (12 contract tests in parallel):
Task: "Contract test GET /api/products in tests/contract/features/sales/subscriptions/products.contract.test.ts"
Task: "Contract test GET /api/products/:id in tests/contract/features/sales/subscriptions/products-detail.contract.test.ts"
Task: "Contract test POST /api/subscriptions/trial in tests/contract/features/sales/subscriptions/trials.contract.test.ts"
Task: "Contract test GET /api/subscriptions/current in tests/contract/features/sales/subscriptions/subscriptions.contract.test.ts"
Task: "Contract test PATCH /api/subscriptions/:id/cancel in tests/contract/features/sales/subscriptions/cancellation.contract.test.ts"
Task: "Contract test GET /api/subscriptions/:id/status in tests/contract/features/sales/subscriptions/status.contract.test.ts"
Task: "Contract test GET /api/v1/credits/balance in tests/contract/features/sales/credits/balance.contract.test.ts"
Task: "Contract test GET /api/v1/credits/packages in tests/contract/features/sales/credits/packages.contract.test.ts"
Task: "Contract test POST /api/v1/credits/purchase-lead in tests/contract/features/sales/credits/purchase-lead.contract.test.ts"
Task: "Contract test GET /api/v1/leads/marketplace in tests/contract/features/sales/marketplace/leads.contract.test.ts"
Task: "Contract test GET /api/v1/leads/:id/preview in tests/contract/features/sales/marketplace/lead-preview.contract.test.ts"
Task: "Contract test GET /api/v1/leads/purchased in tests/contract/features/sales/marketplace/purchased-leads.contract.test.ts"
```

### Phase 3.2 - All Integration Tests (Different Files)
```bash
# Launch T023-T041 together (19 integration tests in parallel):
Task: "Integration test View Pricing Plans in tests/integration/features/sales/subscriptions/pricing-flow.test.tsx"
Task: "Integration test Start Trial in tests/integration/features/sales/subscriptions/trial-activation.test.tsx"
Task: "Integration test View Subscription Status in tests/integration/features/sales/subscriptions/trial-status.test.tsx"
# ... (all integration tests - each in separate file)
```

### Phase 3.3 - All Data Models (Different Prisma Models)
```bash
# Launch T042-T047 together (6 models in parallel):
Task: "Product model with Prisma schema in prisma/schema.prisma"
Task: "Subscription model with Prisma schema in prisma/schema.prisma"
Task: "PaymentHistory model with Prisma schema in prisma/schema.prisma"
Task: "CreditTransaction model with Prisma schema in prisma/schema.prisma"
Task: "Lead model with Prisma schema in prisma/schema.prisma"
Task: "LeadAccess model with Prisma schema in prisma/schema.prisma"
```

### Phase 3.4 - All Zod Schemas (Different Files)
```bash
# Launch T048-T052 together (5 schema files in parallel):
Task: "Product validation schemas in src/features/sales/contracts/sales.contracts.ts"
Task: "Subscription validation schemas in src/features/sales/contracts/sales.contracts.ts"
Task: "Payment validation schema in src/features/sales/contracts/sales.contracts.ts"
Task: "Credits validation schemas in src/features/sales/contracts/credits.contracts.ts"
Task: "Marketplace validation schemas in src/features/sales/contracts/marketplace.contracts.ts"
```

### Phase 3.7 - All Frontend Hooks (Different Files)
```bash
# Launch T070-T078 together (9 hooks in parallel):
Task: "useProducts hook in src/features/sales/hooks/subscriptions/useProducts.ts"
Task: "useSubscription hook in src/features/sales/hooks/subscriptions/useSubscription.ts"
Task: "useTrialActivation hook in src/features/sales/hooks/subscriptions/useTrialActivation.ts"
Task: "useCancelSubscription hook in src/features/sales/hooks/subscriptions/useCancelSubscription.ts"
Task: "useCreditBalance hook in src/features/sales/hooks/credits/useCreditBalance.ts"
Task: "useCreditPackages hook in src/features/sales/hooks/credits/useCreditPackages.ts"
Task: "usePurchaseLead hook in src/features/sales/hooks/marketplace/usePurchaseLead.ts"
Task: "useMarketplaceLeads hook in src/features/sales/hooks/marketplace/useMarketplaceLeads.ts"
Task: "usePurchasedLeads hook in src/features/sales/hooks/marketplace/usePurchasedLeads.ts"
```

### Phase 3.8 - All Components (Different Files)
```bash
# Launch T079-T098 together (20 components in parallel):
Task: "PricingCard component in src/features/sales/components/subscriptions/PricingCard.tsx"
Task: "PricingTable component in src/features/sales/components/subscriptions/PricingTable.tsx"
# ... (all components - each in separate file)
```

### Phase 3.14 - All Unit Tests (Different Files)
```bash
# Launch T122-T127 together (6 unit tests in parallel):
Task: "Unit test for trial calculations in tests/unit/features/sales/services/trial-calculations.test.ts"
Task: "Unit test for price formatting in tests/unit/features/sales/utils/formatting.test.ts"
Task: "Unit test for state transitions in tests/unit/features/sales/services/state-transitions.test.ts"
Task: "Unit test for lead masking in tests/unit/features/sales/utils/masking.test.ts"
Task: "Unit test for credit balance in tests/unit/features/sales/services/credit-balance.test.ts"
Task: "Unit test for session limit in tests/unit/features/sales/services/session-limit.test.ts"
```

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to run in parallel
- **Sequential tasks**: Same file or dependent logic - must run in order
- **TDD Critical**: ALL tests (T011-T041) MUST fail before implementation begins
- **Commit strategy**: Commit after each task completion
- **API-First**: Frontend consumes REST API endpoints - backend handles all data persistence
- **Real-time updates**: Use polling or WebSocket for subscription/credit status changes
- **Performance**: Target metrics are enforced in T137 validation

---

## Validation Checklist

**Before marking feature complete:**

- [ ] All 12 contract tests pass (T011-T022) ✓
- [ ] All 15 integration tests pass (T023-T037) ✓
- [ ] All 4 performance tests meet targets (T038-T041) ✓
- [ ] All 6 unit test suites pass (T116-T121) ✓
- [ ] All 6 TypeScript type definitions created (T042-T047) ✓
- [ ] All 5 Zod validation schemas implemented (T048-T052) ✓
- [ ] All 6 services implemented (T053-T058) ✓
- [ ] All 5 API client modules created (T059-T063) ✓
- [ ] All 9 hooks working (T064-T072) ✓
- [ ] All 20 components built (T073-T092) ✓
- [ ] All 5 pages functional (T093-T097) ✓
- [ ] Payment integration complete (T104-T106) ✓
- [ ] Notifications working (T107-T109) ✓
- [ ] Auth guards active (T110-T112) ✓
- [ ] Routing configured (T113-T115) ✓
- [ ] Manual testing scenarios 1-15 verified (T136) ✓
- [ ] Accessibility audit passed (T138) ✓
- [ ] Mobile/cross-browser tested (T139-T140) ✓
- [ ] Security audit passed (T141) ✓
- [ ] E2E testing passed (T142) ✓
- [ ] Documentation updated (T127-T129) ✓
- [ ] Code cleanup done (T130-T132) ✓

---

**Total Tasks**: 142
- Setup: 10 tasks (T001-T010)
- Tests: 31 tasks (T011-T041)
- Models & Validation: 11 tasks (T042-T052)
- Services: 6 tasks (T053-T058)
- Endpoints: 11 tasks (T059-T069)
- Hooks: 9 tasks (T070-T078) → **ALL COMPLETED** (T064-T072)
- Components: 20 tasks (T079-T098) → **ALL COMPLETED** (T073-T092)
- Pages: 5 tasks (T099-T103) → **RENUMBERED: T093-T097 - ALL COMPLETED**
- Integration: 18 tasks (T104-T121) → **T113-T115 COMPLETED**
- Polish & Validation: 27 tasks (T122-T148)

**Progress: 65/142 tasks (45.8%) completed**
- ✅ Setup (10 tasks - T001-T010)
- ✅ Types & Validation (11 tasks - T042-T052)
- ✅ Services (6 tasks - T053-T058)
- ✅ API Integration (11 tasks - T059-T063)
- ✅ **Hooks (9 tasks - T064-T072) - ALL COMPLETED**
- ✅ **Components (20 tasks - T073-T092) - ALL COMPLETED**
- ✅ **Pages (5 tasks - T093-T097) - ALL COMPLETED**
- ✅ Navigation Integration (3 tasks - T113-T115)
- ⏳ Tests (pending - T003-T041)
- ⏳ Payment Integration (pending - T104-T112)
- ⏳ Polish (pending - T116+)

**Estimated Parallel Batches**: 15-20 batches (many tasks can run concurrently)
**Estimated Completion Time**: 3-4 weeks with proper parallelization

---

*Tasks generated from design documents on 2025-10-04*
*Ready for execution via /implement command*
