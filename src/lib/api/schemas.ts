import { z } from 'zod';

// Base schemas
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });

// User and Auth schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'org_admin', 'agent', 'viewer']),
  organizationId: z.string(),
  avatar: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// Organization schemas
export const OrganizationPlanSchema = z.enum(['basic', 'professional', 'enterprise', 'white_label']);

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  cnpj: z.string().optional(),
  plan: OrganizationPlanSchema,
  quota: z.object({
    total: z.number(),
    used: z.number(),
    resetDate: z.string(),
  }),
  settings: z.object({
    theme: z.object({
      primaryColor: z.string().optional(),
      logo: z.string().optional(),
      domain: z.string().optional(),
    }).optional(),
    webhooks: z.array(z.object({
      id: z.string(),
      url: z.string().url(),
      events: z.array(z.string()),
      secret: z.string(),
      active: z.boolean(),
    })).optional(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Lead schemas
export const LeadSegmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  segment: LeadSegmentSchema,
  qualityScore: z.number().min(0).max(100),
  tags: z.array(z.string()),
  customFields: z.record(z.any()).optional(),
  metadata: z.object({
    source: z.string(),
    collectedAt: z.string(),
    lastEnrichedAt: z.string().optional(),
    confidence: z.number().min(0).max(1),
  }),
  accessCost: z.number().nonnegative(),
  isAccessed: z.boolean(),
  accessedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LeadAccessSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  cost: z.number().nonnegative(),
  accessedAt: z.string(),
});

export const LeadFilterSchema = z.object({
  search: z.string().optional(),
  segmentId: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  qualityScore: z.object({
    min: z.number().min(0).max(100).optional(),
    max: z.number().min(0).max(100).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  isAccessed: z.boolean().optional(),
});

// Pipeline schemas
export const PipelineStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  order: z.number(),
});

export const PipelineLeadSchema = z.object({
  id: z.string(),
  lead: LeadSchema,
  stageId: z.string(),
  value: z.number().optional(),
  notes: z.string().optional(),
  activities: z.array(z.object({
    id: z.string(),
    type: z.enum(['call', 'email', 'meeting', 'note']),
    description: z.string(),
    completedAt: z.string().optional(),
    createdAt: z.string(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Usage and Analytics schemas
export const UsageMetricsSchema = z.object({
  period: z.object({
    from: z.string(),
    to: z.string(),
  }),
  leadsAccessed: z.number(),
  apiRequests: z.number(),
  totalCost: z.number(),
  quotaUsed: z.number(),
  quotaTotal: z.number(),
  conversionRate: z.number().min(0).max(1),
});

export const AnalyticsDataSchema = z.object({
  date: z.string(),
  leadsCollected: z.number(),
  leadsAccessed: z.number(),
  qualityAverage: z.number(),
  cost: z.number(),
  conversions: z.number(),
});

// API Key schemas
export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  permissions: z.array(z.string()),
  lastUsedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationPlan = z.infer<typeof OrganizationPlanSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type LeadSegment = z.infer<typeof LeadSegmentSchema>;
export type LeadAccess = z.infer<typeof LeadAccessSchema>;
export type LeadFilter = z.infer<typeof LeadFilterSchema>;
export type PipelineStage = z.infer<typeof PipelineStageSchema>;
export type PipelineLead = z.infer<typeof PipelineLeadSchema>;
export type UsageMetrics = z.infer<typeof UsageMetricsSchema>;
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};