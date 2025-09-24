// Health Check Service - Monitor API connectivity and health
export interface HealthStatus {
  isOnline: boolean;
  lastCheck: Date;
  responseTime?: number;
  apiVersion?: string;
  error?: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class HealthCheckService {
  private healthStatus: HealthStatus = {
    isOnline: false,
    lastCheck: new Date(),
  };
  
  private listeners: Set<(status: HealthStatus) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    this.startHealthCheck();
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck(intervalMs: number = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.performHealthCheck();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  /**
   * Stop health checks
   */
  stopHealthCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Perform a health check on the API
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${this.API_BASE_URL}/api/v1/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        this.healthStatus = {
          isOnline: true,
          lastCheck: new Date(),
          responseTime,
          apiVersion: data.version,
        };
      } else {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.healthStatus = {
        isOnline: false,
        lastCheck: new Date(),
        responseTime,
        error: errorMessage,
      };
    }

    // Notify listeners
    this.notifyListeners();
    return this.healthStatus;
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if API is currently online
   */
  isApiOnline(): boolean {
    return this.healthStatus.isOnline;
  }

  /**
   * Add a listener for health status changes
   */
  addStatusListener(callback: (status: HealthStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.healthStatus);
      } catch (error) {
        console.error('Error notifying health status listener:', error);
      }
    });
  }

  /**
   * Execute a request with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customRetryConfig };
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Check if API is online before attempting (except on first try)
        if (attempt > 0 && !this.isApiOnline()) {
          // Perform a health check to see if API came back online
          await this.performHealthCheck();
          
          if (!this.isApiOnline()) {
            throw new Error('API is currently offline');
          }
        }

        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw lastError;
        }

        // Don't wait after the last attempt
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
            config.maxDelay
          );
          
          console.warn(`Request failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
          
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Determine if an error should not be retried
   */
  private shouldNotRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Don't retry authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return true;
      }
      
      // Don't retry validation errors
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        return true;
      }
      
      // Don't retry forbidden errors
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get user-friendly error message for connectivity issues
   */
  getConnectivityErrorMessage(): string {
    if (!this.isApiOnline()) {
      return 'Sem conexão com o servidor. Verifique sua internet ou tente novamente em alguns minutos.';
    }
    
    return 'Erro temporário de conexão. Tentando novamente...';
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopHealthCheck();
    this.listeners.clear();
  }
}

// Singleton instance
export const healthCheckService = new HealthCheckService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    healthCheckService.destroy();
  });
}