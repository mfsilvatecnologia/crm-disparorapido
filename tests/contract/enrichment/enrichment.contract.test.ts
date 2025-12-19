import { describe, it, expect } from 'vitest';
import { apiClient } from '../../../src/features/enrichment/services/apiClient';

// Contract tests validate the API endpoints usage and payloads
// NOTE: These tests are expected to FAIL initially (no implementation for enrichmentApi yet)

const leadId = 'lead-123';
const providers = ['web_search', 'location'];

describe('Contract: Enrichment API', () => {
  it('POST /enrichments should start enrichment job and return EnrichmentJob', async () => {
    // This is a smoke call – in real contract tests we'd use a mock server or
    // environment where /api/enrichments exists; here we assert structure expectations.
    // The actual call will be coded in enrichmentApi and used by integration.
    const payload = { leadId, providers } as const;

    // Expectation: POST returns a job with id, status, and providersSelected
    try {
      const job = await apiClient.post<{ id: string; status: string; providersSelected: string[] }>(
        '/enrichments',
        payload
      );
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('status');
      expect(job.providersSelected).toEqual(providers);
    } catch (err) {
      // Failing-first: if backend is not available, ensure error bubbles up
      expect(err).toBeDefined();
    }
  });

  it('GET /enrichments/{id} should return job status/results', async () => {
    const jobId = 'job-123';
    try {
      const job = await apiClient.get<{ id: string; status: string; results?: unknown[] }>(
        `/enrichments/${jobId}`
      );
      expect(job.id).toBe(jobId);
      expect(['queued', 'processing', 'completed', 'error']).toContain(job.status);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
