/**
 * API: migração cartão → PIX Automático
 */

import { apiClient } from '@/lib/api-client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface StartPixMigrationResult {
  authorizationId: string;
  pixQrCodeUrl: string | null;
  pixCopyPasteCode: string | null;
  migrationPending?: true;
  restorePending?: true;
  subscriptionId: string;
}

export interface PixMigrationStatusResult {
  migrationPending: boolean;
  authorizationId?: string;
  status?: string;
  confirmed?: boolean;
  pixQrCodeUrl?: string | null;
  pixCopyPasteCode?: string | null;
  completed?: boolean;
}

const SUBSCRIPTIONS_PATH = '/api/v1/subscriptions';

export async function startPixAutomaticMigration(
  subscriptionId: string
): Promise<StartPixMigrationResult> {
  const response = await apiClient.post<ApiResponse<StartPixMigrationResult>>(
    `${SUBSCRIPTIONS_PATH}/${subscriptionId}/migrate-to-pix-automatic`,
    {}
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Falha ao iniciar migração para PIX Automático');
  }

  return response.data;
}

export async function startPixAutomaticRestore(
  subscriptionId: string
): Promise<StartPixMigrationResult> {
  const response = await apiClient.post<ApiResponse<StartPixMigrationResult>>(
    `${SUBSCRIPTIONS_PATH}/${subscriptionId}/restore-with-pix-automatic`,
    {}
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Falha ao iniciar reativação com PIX Automático');
  }

  return response.data;
}

export async function getPixMigrationStatus(
  subscriptionId: string
): Promise<PixMigrationStatusResult> {
  const response = await apiClient.get<ApiResponse<PixMigrationStatusResult>>(
    `${SUBSCRIPTIONS_PATH}/${subscriptionId}/pix-migration-status`
  );

  if (!response.success) {
    throw new Error(response.message || 'Falha ao consultar status da migração');
  }

  return response.data;
}
