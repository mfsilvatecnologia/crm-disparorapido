# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production 
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

This is a React CRM frontend application built with Vite, TypeScript, and shadcn/ui components. The application follows a multi-tenant architecture with organization-based access control.

### Key Architecture Patterns

**Authentication & Authorization Flow:**
- JWT-based authentication with refresh tokens managed in `src/contexts/AuthContext.tsx`
- Organization context in `src/contexts/OrganizationContext.tsx` handles multi-tenant organization switching
- Private routes protect authenticated areas, redirecting to `/login` for unauthenticated users
- API client automatically includes organization ID in headers via `X-Org-Id`

**API Client Architecture:**
- Centralized API client in `src/lib/api/client.ts` with automatic token management
- Zod schema validation for all API responses in `src/lib/api/schemas.ts`
- Error handling with custom `ApiError` class for consistent error responses
- Support for pagination, filtering, and bulk operations

**State Management:**
- React Query for server state management with 1 retry and no window refocus
- React Context for authentication and organization state
- Local storage for token persistence and organization preferences

**Component Architecture:**
- shadcn/ui components in `src/components/ui/` for consistent design system
- Layout components in `src/components/layout/` (AppLayout, AppHeader, AppSidebar)
- Dashboard components in `src/components/dashboard/` for analytics and KPIs
- Shared components in `src/components/shared/` for reusable business logic

### Router Structure

```
/ (protected)
├── / (Dashboard)
├── /leads (LeadsPage) 
├── /segments (placeholder)
├── /pipeline (placeholder)
├── /sales-tools (placeholder)
├── /billing (placeholder)
├── /settings (placeholder)
└── /admin/organizations (placeholder)
/login (public)
/404 (NotFound)
```

### Environment Configuration

- `VITE_API_BASE_URL` - Backend API URL (defaults to `http://localhost:8000`)
- Development server runs on port 8080 with IPv6 support

### TypeScript Configuration

- Path alias `@/*` maps to `./src/*`
- Relaxed TypeScript settings: `noImplicitAny: false`, `strictNullChecks: false`
- Separate configs for app (`tsconfig.app.json`) and build tools (`tsconfig.node.json`)

## Project Context

This appears to be a leads management CRM system ("leadsrapido") with the following core features:
- User authentication and multi-organization support
- Lead management with filtering, pagination, and export capabilities
- Analytics dashboard with KPIs, charts, and regional data
- Usage metrics tracking for organizations
- API key management for integrations

The frontend communicates with a backend API that handles lead data, user management, and analytics. Many features are marked as "Em desenvolvimento" (In development) indicating this is an active project.