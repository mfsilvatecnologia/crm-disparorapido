/**
 * Token Refresh Service
 *
 * Gerencia o refresh automático do token de acesso baseado no tempo de expiração.
 * Monitora o token atual e dispara refresh antes da expiração.
 */

import { authStorage } from '@/shared/utils/storage';
import { getTimeUntilExpiration, isTokenExpired } from '@/shared/utils/token';
import { refreshAccessToken } from './authService';

/**
 * Token Refresh Manager
 * Singleton que gerencia o refresh automático do token
 */
class TokenRefreshManager {
  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private onTokenRefreshed?: (newToken: string) => void;
  private onRefreshError?: (error: Error) => void;

  // Tempo antes da expiração para fazer refresh (5 minutos em ms)
  private readonly REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

  /**
   * Inicia o monitoramento automático do token
   */
  start(
    onTokenRefreshed?: (newToken: string) => void,
    onRefreshError?: (error: Error) => void
  ): void {
    this.onTokenRefreshed = onTokenRefreshed;
    this.onRefreshError = onRefreshError;

    // Inicia o ciclo de refresh
    this.scheduleNextRefresh();
  }

  /**
   * Para o monitoramento automático
   */
  stop(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  /**
   * Agenda o próximo refresh baseado no tempo de expiração do token
   */
  private scheduleNextRefresh(): void {
    // Limpa qualquer timeout anterior
    this.stop();

    const token = authStorage.getAccessToken();

    if (!token) {
      console.log('[TokenRefresh] Nenhum token encontrado, não agendando refresh');
      return;
    }

    // Verifica se o token já está expirado
    if (isTokenExpired(token)) {
      console.log('[TokenRefresh] Token já expirado, tentando refresh imediatamente');
      this.performRefresh();
      return;
    }

    // Calcula quando fazer o refresh
    const timeUntilExpiry = getTimeUntilExpiration(token);
    const timeUntilRefresh = Math.max(0, timeUntilExpiry - this.REFRESH_BEFORE_EXPIRY_MS);

    console.log(
      `[TokenRefresh] Agendando refresh em ${Math.round(timeUntilRefresh / 1000)}s ` +
      `(${Math.round(timeUntilRefresh / 60000)} minutos)`
    );

    // Agenda o refresh
    this.refreshTimeoutId = setTimeout(() => {
      this.performRefresh();
    }, timeUntilRefresh);
  }

  /**
   * Executa o refresh do token
   */
  private async performRefresh(): Promise<void> {
    try {
      console.log('[TokenRefresh] Iniciando refresh do token...');

      const response = await refreshAccessToken();
      const newToken = response.data.access_token;

      console.log('[TokenRefresh] Token refreshed com sucesso');

      // Notifica callbacks
      if (this.onTokenRefreshed) {
        this.onTokenRefreshed(newToken);
      }

      // Agenda o próximo refresh
      this.scheduleNextRefresh();

    } catch (error) {
      console.error('[TokenRefresh] Erro ao fazer refresh do token:', error);

      // Notifica erro
      if (this.onRefreshError) {
        this.onRefreshError(error as Error);
      }

      // Em caso de erro, tenta novamente em 1 minuto
      // (pode ser útil para erros de rede temporários)
      const retryDelay = 60 * 1000; // 1 minuto
      console.log(`[TokenRefresh] Tentando novamente em ${retryDelay / 1000}s`);

      this.refreshTimeoutId = setTimeout(() => {
        this.performRefresh();
      }, retryDelay);
    }
  }

  /**
   * Força um refresh imediato do token
   * Útil quando o usuário faz uma ação e detectamos que o token está para expirar
   */
  async forceRefresh(): Promise<void> {
    this.stop();
    await this.performRefresh();
  }

  /**
   * Verifica se o refresh está ativo
   */
  isActive(): boolean {
    return this.refreshTimeoutId !== null;
  }
}

// Exporta instância singleton
export const tokenRefreshManager = new TokenRefreshManager();

/**
 * Hook helper para usar o token refresh manager
 * @returns objeto com métodos de controle do refresh
 */
export function useTokenRefresh() {
  return {
    start: (
      onTokenRefreshed?: (newToken: string) => void,
      onRefreshError?: (error: Error) => void
    ) => tokenRefreshManager.start(onTokenRefreshed, onRefreshError),
    stop: () => tokenRefreshManager.stop(),
    forceRefresh: () => tokenRefreshManager.forceRefresh(),
    isActive: () => tokenRefreshManager.isActive(),
  };
}
